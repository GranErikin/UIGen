"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Worker_1 = require("./Worker");
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
const EHRGateway_1 = require("../gateways/EHRGateway");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
class OPT2HTMLWorker extends Worker_1.Worker {
    constructor() {
        super(...arguments);
        this.topic = "opt2html";
        this.variableNames = ["template"];
    }
    validateInput() {
        return [];
    }
    work(params) {
        return new Promise((resolve, reject) => {
            try {
                let options = new EHRGateway_1.FetchTemplateRequestOptions(params.token, params.templateId);
                this.gatewayFactory.build(options).request().then((response) => {
                    const processVariables = new camunda_external_task_client_js_1.Variables();
                    processVariables.setTyped("template", {
                        value: response.body,
                        type: "Xml",
                        valueInfo: {
                            transient: true
                        }
                    });
                    resolve(new Worker_1.WorkResults(processVariables));
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
    }
}
exports.OPT2HTMLWorker = OPT2HTMLWorker;
//# sourceMappingURL=OPT2HTMLWorker.js.map