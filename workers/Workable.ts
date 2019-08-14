import {Variables, Task, TaskService} from "camunda-external-task-client-js";
import {InputValidationError} from "./exceptions/WorkerExceptions";

export interface WorkResults {
    processVariablesResult: Variables;
    localVariablesResult?: Variables;
}

export interface Workable {

    topic: string;

    parameterNames: string[];

    validateInput(): InputValidationError[];

    work(): Promise<WorkResults>;

}
