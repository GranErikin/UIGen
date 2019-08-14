import {Workable, WorkResults} from "./Workable";
import {Task, TaskService} from "camunda-external-task-client-js";
import {
    InputValidationError, InputValidationFailedException,
    MissingInputException, WorkerException
} from "./exceptions/WorkerExceptions";

/*
@param {string} topic               The topic name which needs to be referenced by the external task so a specific worker can handle it
@param {string[]} parameterNames    A list of strings containing the names of the variables required for a given worker to perform normally, this list is used to
                                    retrieve the values from the "task" object and will report an error to the workflow if any variable from the list is not found
@param {Object} params              If all the values from "parameterNames" are found this object will contain them for convenience
*/
export abstract class Worker implements Workable {

    abstract topic: string;

    abstract parameterNames: string[];

    params: any = {};

    /*
    * Default handler function for all workers, it calls utility functions mapInput(task), then validates the input and finally executes the work.
    * If validation does not pass it will handleError on the given task and pass the resulting error messages
    */
    async handle(task: Task, taskService: TaskService) {
        try {
            this.mapInput(task);
            this.validate();
            let workResults = await this.work();
            let completed = await this.complete(task, taskService, workResults);
            console.log(completed);
            console.log(`Worker with topic: ${this.topic} completed work successfully`);
        } catch (workerException) {
            this.handleException(task, taskService, workerException)
        }
    }

    /*
    * Validation wrapper that throws an exception when a validation error was found by the validateInput implementation
    * Throws InputValidationFailedException if any field failed validation
    */
    validate(): void {
        let validations = this.validateInput();
        if (validations.length > 0) {
            throw new InputValidationFailedException(this.topic, validations)
        }
    }

    /*
    * Maps each name in "parameterNames" from the task Object into the params Object for easier access and checks for any missing input parameters
    * Throws MissingInputException if any required field is missing
    */
    mapInput(task: Task): void {
        let missingInputs = [];
        this.parameterNames.forEach((parameter) => {
            let value = task.variables.get(parameter);
            if (value == null) {
                missingInputs.push(parameter);
            } else {
                this.params[parameter] = value;
            }
        });
        if (missingInputs.length > 0) {
            throw new MissingInputException(missingInputs);
        }
    }

    /*
    * Utility function that completes the task with the given WorkResults, if localVariables are added to the WorkResults they are added
    * automatically
    */
    complete(task: Task, taskService: TaskService, workResults: WorkResults): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = workResults.localVariablesResult ?
                    await taskService.complete(task, workResults.processVariablesResult, workResults.localVariablesResult) :
                    await taskService.complete(task, workResults.processVariablesResult);
                resolve(result);
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
            console.error(workerException.message);
            let response = await taskService.handleFailure(task, {
                errorMessage: `Worker with topic: ${this.topic} failed to complete work`,
                errorDetails: workerException.message,
                retries: 0,
                retryTimeout: 0
            });
            console.error(`Worker with topic: ${this.topic} failure handled`);
            console.error(response);
        } catch (err) {
            console.error(err);
        }
    }

    abstract validateInput(): InputValidationError[];

    abstract work();

}

