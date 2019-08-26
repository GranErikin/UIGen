"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
/*
* Utility class that wraps two "Variables" instances that are delivered to the TaskService when completing the task
* the localVariablesResult parameter is optional
*/
class WorkResults {
    constructor(processVariablesResult, localVariablesResult) {
        this.processVariablesResult = processVariablesResult;
        this.localVariablesResult = localVariablesResult;
    }
}
exports.WorkResults = WorkResults;
/*
@param {string} topic               The topic name which needs to be referenced by the external task so a specific worker can handle it
@param {string[]} variableNames     An array containing the variable names this worker requires from the received Task object. The mapInput() function maps
                                    this variables into an object that is then passed to the validateInput() and work() functions for easier access.
                                    So instead of calling task.variables.get("variableName") you can call params.variableName directly
*/
let Worker = class Worker {
    constructor(workerLogger) {
        this.workerLogger = workerLogger;
    }
    /*
    * Default handler function for all workers, it calls utility functions mapInput(task), then validates the input and finally executes the work.
    * If validation does not pass it will handleError on the given task and pass the resulting error messages
    */
    handle(taskWrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = this.mapInput(taskWrapper.task);
                this.validate(params);
                const workResults = yield this.work(params);
                yield this.complete(taskWrapper.task, taskWrapper.taskService, workResults);
                this.workerLogger.info(`Worker with topic: ${this.topic} completed work successfully`);
            }
            catch (workerException) {
                this.handleException(taskWrapper.task, taskWrapper.taskService, workerException);
            }
        });
    }
    /*
    * Validation wrapper that throws an exception when a validation error was found by the validateInput implementation
    * Throws InputValidationFailedException if any field failed validation
    */
    validate(params) {
        const validations = this.validateInput(params);
        if (validations.length > 0) {
            throw new WorkerExceptions_1.InputValidationFailedException(this.topic, validations);
        }
    }
    /*
    * Maps each name in "parameterNames" from the task Object into the params Object for easier access and checks for any missing input parameters
    * If parameter Contains a single element with value "all" or "variables" all variables are return wrapped in a Variables object
    * Throws MissingInputException if any required field is missing
    */
    mapInput(task) {
        const missingInputs = [];
        const paramsHolder = {};
        if (this.variableNames.length === 1 && this.variableNames[0] === "all") {
            paramsHolder.taskVariables = task.variables;
            return paramsHolder;
        }
        this.variableNames.forEach((variableName) => {
            const value = task.variables.get(variableName);
            if (value == null) {
                missingInputs.push(variableName);
            }
            else {
                paramsHolder[variableName] = value;
            }
        });
        if (missingInputs.length > 0) {
            throw new WorkerExceptions_1.MissingInputException(missingInputs);
        }
        else {
            return paramsHolder;
        }
    }
    /*
    * Utility function that completes the task with the given WorkResults, if localVariables are added to the WorkResults they are added
    * automatically
    */
    complete(task, taskService, workResults) {
        //this.workerLogger.info(taskService);
        return new Promise((resolve, reject) => {
            try {
                if (workResults.localVariablesResult) {
                    taskService.complete(task, workResults.processVariablesResult, workResults.localVariablesResult).then((result) => {
                        resolve(result);
                    });
                    return;
                }
                taskService.complete(task, workResults.processVariablesResult).then((result) => {
                    resolve(result);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /*
    * Utility function that log the exception's message and handles the Failure, ending the current task with an error
    */
    handleException(task, taskService, workerException) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield taskService.handleFailure(task, {
                    errorMessage: `Worker with topic: ${this.topic} failed to complete work`,
                    errorDetails: workerException.message,
                    retries: 0,
                    retryTimeout: 0
                });
                this.workerLogger.error(`Worker with topic: ${this.topic} failure handled`);
                this.workerLogger.error(workerException.message);
            }
            catch (err) {
                this.workerLogger.error(`Unable to handle Failure for Worker with topic: ${this.topic}`);
                this.workerLogger.error(err);
            }
        });
    }
};
Worker = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.Logger)), __param(0, inversify_1.named("workerLogger")),
    __metadata("design:paramtypes", [Object])
], Worker);
exports.Worker = Worker;
//# sourceMappingURL=Worker.js.map