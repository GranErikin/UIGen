import {Worker, WorkResults} from "./Worker";
import {InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";

interface VariableLoggerParams {
    taskVariables: Variables
}

class VariableLoggerWorker extends Worker {
    readonly topic = "logger";
    readonly variableNames = ["all"];

    validateInput(): InputValidationError[] {
        return [];
    }

    work(params: VariableLoggerParams): Promise<WorkResults> {

        this.workerLogger.info(params.taskVariables.getAllTyped());
        return new Promise<WorkResults>((resolve) => {
            resolve(new WorkResults(params.taskVariables))
        });
    }

}

export {VariableLoggerWorker}