import {Task, TaskService, Variables} from "camunda-external-task-client-js";
import {
    InputValidationError, InputValidationFailedException,
    MissingInputException, WorkerException
} from "./exceptions/WorkerExceptions";
import {inject, injectable, named} from "inversify";
import {TYPES} from "../di/types";
import {Logger} from "../di/ThirdPartyTypes";

/*
* Utility class that wraps two "Variables" instances that are delivered to the TaskService when completing the task
* the localVariablesResult parameter is optional
*/
class WorkResults {
    processVariablesResult: Variables;
    localVariablesResult?: Variables;

    constructor(processVariablesResult: Variables, localVariablesResult?: Variables) {
        this.processVariablesResult = processVariablesResult;
        this.localVariablesResult = localVariablesResult ? localVariablesResult : new Variables()
    }
}

/*
* Utility wrapper for the the {Task, TaskService} object delivered to the worker after polling a task
*/
interface TaskWrapper {
    task: Task;
    taskService: TaskService;
}

/*
@param {string} topic               The topic name which needs to be referenced by the external task so a specific worker can handle it
@param {string[]} variableNames     An array containing the variable names this worker requires from the received Task object. The mapInput() function maps
                                    this variables into an object that is then passed to the validateInput() and work() functions for easier access.
                                    So instead of calling task.variables.get("variableName") you can call params.variableName directly
*/
@injectable()
abstract class Worker {


    abstract readonly topic: string;

    abstract readonly variableNames: string[];

    readonly workerLogger: Logger;

    protected constructor(
        @inject(TYPES.Logger) @named("workerLogger")workerLogger: Logger) {
        this.workerLogger = workerLogger;
    }

    /*
    * Abstract function to be implemented by concretions, it takes the object mapped by mapInput(Task) in case additional validation is required
    * In case a value fails validation an InputValidationError instance must be created and return in the array required
    * It is recommended to override the type of the params argument to enable type checking for the validateInput function
    */
    abstract validateInput(params: any): InputValidationError[];

    /*
    * Abstract function to be implemented by concretions, it takes the object mapped by mapInput(Task) to do the actual work to be performed by the worker
    * It must return a Promise that resolves the
    * It is recommended to override the type of the params argument to enable type checking for the work function
    */
    abstract work(params: any): Promise<WorkResults>;

    /*
    * Default handler function for all workers, it calls utility functions mapInput(task), then validates the input and finally executes the work.
    * If validation does not pass it will handleError on the given task and pass the resulting error messages
    */
    async handle(taskWrapper: TaskWrapper) {
        try {
            const params = this.mapInput(taskWrapper.task);
            this.validate(params);
            const workResults = await this.work(params);
            const completed = await this.complete(taskWrapper.task, taskWrapper.taskService, workResults);
            this.workerLogger.info(completed);
            this.workerLogger.info(`Worker with topic: ${this.topic} completed work successfully`);
        } catch (workerException) {
            this.handleException(taskWrapper.task, taskWrapper.taskService, workerException)
        }
    }

    /*
    * Validation wrapper that throws an exception when a validation error was found by the validateInput implementation
    * Throws InputValidationFailedException if any field failed validation
    */
    validate(params: any): void {
        const validations = this.validateInput(params);
        if (validations.length > 0) {
            throw new InputValidationFailedException(this.topic, validations)
        }
    }

    /*
    * Maps each name in "parameterNames" from the task Object into the params Object for easier access and checks for any missing input parameters
    * Throws MissingInputException if any required field is missing
    */
    mapInput(task: Task) {
        const missingInputs: string[] = [];
        const paramsHolder: any = {};
        this.variableNames.forEach((variableName) => {
            const value = task.variables.get(variableName);
            if (value == null) {
                missingInputs.push(variableName);
            } else {
                paramsHolder[variableName] = value;
            }
        });
        if (missingInputs.length > 0) {
            throw new MissingInputException(missingInputs);
        } else {
            return paramsHolder;
        }
    }

    /*
    * Utility function that completes the task with the given WorkResults, if localVariables are added to the WorkResults they are added
    * automatically
    */
    complete(task: Task, taskService: TaskService, workResults: WorkResults): Promise<any> {
        this.workerLogger.info(taskService);
        return new Promise((resolve, reject): void => {
            try {
                taskService.complete(task, workResults.processVariablesResult, workResults.localVariablesResult).then((result) => {
                    resolve(result);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /*
    * Utility function that log the exception's message and handles the Failure, ending the current task with an error
    */
    async handleException(task: Task, taskService: TaskService, workerException: WorkerException) {
        try {
            await taskService.handleFailure(task, {
                errorMessage: `Worker with topic: ${this.topic} failed to complete work`,
                errorDetails: workerException.message,
                retries: 0,
                retryTimeout: 0
            });
            this.workerLogger.error(`Worker with topic: ${this.topic} failure handled`);
            this.workerLogger.error(workerException.message);
        } catch (err) {
            this.workerLogger.error(`Unable to handle Failure for Worker with topic: ${this.topic}`);
            this.workerLogger.error(err);
        }
    }

}

export {Worker, WorkResults}
