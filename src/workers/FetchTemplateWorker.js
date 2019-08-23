"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Worker_1 = require("./Worker");
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const isUUID = require("is-uuid");
const EHRGateway_1 = require("../gateways/EHRGateway");
class FetchTemplateWorker extends Worker_1.Worker {
    constructor() {
        super(...arguments);
        this.topic = "fetchTemplate";
        this.variableNames = ["token", "templateId"];
    }
    validateInput(params) {
        const token = params.token;
        const tokenRegex = '^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$';
        const templateId = params.templateId;
        const errors = [];
        if (!token.match(tokenRegex)) {
            errors.push({
                variableName: "token",
                value: token,
                validationErrorMessage: "The token doesn't comply with JWT format, invalid token"
            });
        }
        if (!isUUID.v4(templateId)) {
            errors.push({
                variableName: "templateId",
                value: templateId,
                validationErrorMessage: "This template id doesn't comply with uuid v4 format, invalid uuid"
            });
        }
        return errors;
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
exports.FetchTemplateWorker = FetchTemplateWorker;
//# sourceMappingURL=FetchTemplateWorker.js.map