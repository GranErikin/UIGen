"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
class EnvironmentVariableChecker {
    constructor(envVariables) {
        this.envVariables = envVariables;
    }
    check() {
        if (!this.envVariables.EHR_SERVER_HOST) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("EHR_SERVER_HOST");
        }
        if (!this.envVariables.EHR_SERVER_USERNAME) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("EHR_SERVER_USERNAME");
        }
        if (!this.envVariables.EHR_SERVER_PASSWORD) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("EHR_SERVER_PASSWORD");
        }
        if (!this.envVariables.CAMUNDA_HOST) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("CAMUNDA_HOST");
        }
        if (!this.envVariables.WORKER_ID) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("WORKER_ID");
        }
        if (!this.envVariables.MAX_TASKS) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("MAX_TASKS");
        }
        if (!this.envVariables.MAX_PARALLEL_EXECUTIONS) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("MAX_PARALLEL_EXECUTIONS");
        }
        if (!this.envVariables.INTERVAL) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("INTERVAL");
        }
        if (!this.envVariables.LOCK_DURATION) {
            throw new WorkerExceptions_1.EnvironmentVariableMissingException("LOCK_DURATION");
        }
    }
}
exports.EnvironmentVariableChecker = EnvironmentVariableChecker;
//# sourceMappingURL=EnvironmentVariableChecker.js.map