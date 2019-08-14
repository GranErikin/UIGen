"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
/*
@param {string} topic               The topic name which needs to be referenced by the external task so a specific worker can handle it
@param {string[]} parameterNames    A list of strings containing the names of the variables required for a given worker to perform normally, this list is used to
                                    retrieve the values from the "task" object and will report an error to the workflow if any variable from the list is not found
@param {Object} params              If all the values from "parameterNames" are found this object will contain them for convenience
*/
class Worker {
    constructor() {
        this.params = {};
    }
    /*
    * Default handler function for all workers, it calls utility functions mapInput(task), then validates the input and finally executes the work.
    * If validation does not pass it will handleError on the given task and pass the resulting error messages
    */
    handle(task, taskService) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mapInput(task);
                this.validate();
                let workResults = yield this.work();
                let completed = yield this.complete(task, taskService, workResults);
                console.log(completed);
                console.log(`Worker with topic: ${this.topic} completed work successfully`);
            }
            catch (workerException) {
                this.handleException(task, taskService, workerException);
            }
        });
    }
    /*
    * Validation wrapper that throws an exception when a validation error was found by the validateInput implementation
    * Throws InputValidationFailedException if any field failed validation
    */
    validate() {
        let validations = this.validateInput();
        if (validations.length > 0) {
            throw new WorkerExceptions_1.InputValidationFailedException(this.topic, validations);
        }
    }
    /*
    * Maps each name in "parameterNames" from the task Object into the params Object for easier access and checks for any missing input parameters
    * Throws MissingInputException if any required field is missing
    */
    mapInput(task) {
        let missingInputs = [];
        this.parameterNames.forEach((parameter) => {
            let value = task.variables.get(parameter);
            if (value == null) {
                missingInputs.push(parameter);
            }
            else {
                this.params[parameter] = value;
            }
        });
        if (missingInputs.length > 0) {
            throw new WorkerExceptions_1.MissingInputException(missingInputs);
        }
    }
    /*
    * Utility function that completes the task with the given WorkResults, if localVariables are added to the WorkResults they are added
    * automatically
    */
    complete(task, taskService, workResults) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = workResults.localVariablesResult ?
                    yield taskService.complete(task, workResults.processVariablesResult, workResults.localVariablesResult) :
                    yield taskService.complete(task, workResults.processVariablesResult);
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    /*
    * Utility function that log the exception's message and handles the Failure, ending the current task with an error
    */
    handleException(task, taskService, workerException) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.error(workerException.message);
                let response = yield taskService.handleFailure(task, {
                    errorMessage: `Worker with topic: ${this.topic} failed to complete work`,
                    errorDetails: workerException.message,
                    retries: 0,
                    retryTimeout: 0
                });
                console.error(`Worker with topic: ${this.topic} failure handled`);
                console.error(response);
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
exports.Worker = Worker;
//# sourceMappingURL=Worker.js.map