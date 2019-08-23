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
const Worker_1 = require("./Worker");
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const EHRGateway_1 = require("../gateways/EHRGateway");
class EHRLoginWorker extends Worker_1.Worker {
    constructor() {
        super(...arguments);
        this.topic = "ehrLogin";
        this.variableNames = [];
    }
    validateInput() {
        return [];
    }
    work() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let options = new EHRGateway_1.EHRAuthenticateRequestOptions();
                    this.gatewayFactory.build(options).request().then((response) => {
                        const processVariables = new camunda_external_task_client_js_1.Variables();
                        processVariables.setTyped("token", {
                            value: response.body.token,
                            type: "string",
                            valueInfo: {
                                transient: true
                            }
                        });
                        resolve(new Worker_1.WorkResults(processVariables, undefined));
                    });
                }
                catch (error) {
                    this.workerLogger.error(error);
                    reject(new WorkerExceptions_1.ExternalResourceFailureException({
                        body: error.response.body,
                        error: error.error,
                        message: error.message,
                        uri: error.options.uri,
                        statusCode: error.statusCode
                    }));
                }
            });
        });
    }
}
exports.EHRLoginWorker = EHRLoginWorker;
//# sourceMappingURL=EHRLoginWorker.js.map