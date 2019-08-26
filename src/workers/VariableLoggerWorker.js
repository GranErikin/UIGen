"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Worker_1 = require("./Worker");
class VariableLoggerWorker extends Worker_1.Worker {
    constructor() {
        super(...arguments);
        this.topic = "logger";
        this.variableNames = ["all"];
    }
    validateInput() {
        return [];
    }
    work(params) {
        this.workerLogger.info(params.taskVariables.getAllTyped());
        return new Promise((resolve) => {
            resolve(new Worker_1.WorkResults(params.taskVariables));
        });
    }
}
exports.VariableLoggerWorker = VariableLoggerWorker;
//# sourceMappingURL=VariableLoggerWorker.js.map