import {EnvironmentVariableMissingException} from "./exceptions/WorkerExceptions";

interface EnvironmentVariables {
    EHR_SERVER_HOST?: string;
    EHR_SERVER_USERNAME?: string;
    EHR_SERVER_PASSWORD?: string;
    EHR_SERVER_ORGANIZATION?: string;
    CAMUNDA_HOST?: string;
    WORKER_ID?: string;
    MAX_TASKS?: number;
    MAX_PARALLEL_EXECUTIONS?: number;
    INTERVAL?: number;
    LOCK_DURATION?: number;
}

export class EnvironmentVariableChecker {
    readonly envVariables: EnvironmentVariables;

    constructor(envVariables: EnvironmentVariables) {
        this.envVariables = envVariables;
    }

    check() {
        if (!this.envVariables.EHR_SERVER_HOST) {
            throw new EnvironmentVariableMissingException("EHR_SERVER_HOST");
        }
        if (!this.envVariables.EHR_SERVER_USERNAME) {
            throw new EnvironmentVariableMissingException("EHR_SERVER_USERNAME");
        }
        if (!this.envVariables.EHR_SERVER_PASSWORD) {
            throw new EnvironmentVariableMissingException("EHR_SERVER_PASSWORD");
        }
        if (!this.envVariables.CAMUNDA_HOST) {
            throw new EnvironmentVariableMissingException("CAMUNDA_HOST");
        }
        if (!this.envVariables.WORKER_ID) {
            throw new EnvironmentVariableMissingException("WORKER_ID");
        }
        if (!this.envVariables.MAX_TASKS) {
            throw new EnvironmentVariableMissingException("MAX_TASKS");
        }
        if (!this.envVariables.MAX_PARALLEL_EXECUTIONS) {
            throw new EnvironmentVariableMissingException("MAX_PARALLEL_EXECUTIONS");
        }
        if (!this.envVariables.INTERVAL) {
            throw new EnvironmentVariableMissingException("INTERVAL");
        }
        if (!this.envVariables.LOCK_DURATION) {
            throw new EnvironmentVariableMissingException("LOCK_DURATION");
        }
    }
}