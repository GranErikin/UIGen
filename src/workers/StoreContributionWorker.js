"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Worker_1 = require("./Worker");
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
const EHRGateway_1 = require("../gateways/EHRGateway");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
class StoreContributionWorker extends Worker_1.Worker {
    constructor() {
        super(...arguments);
        this.topic = "storeContribution";
        this.variableNames = ["mergedContribution", "ehrId", "committer", "token"];
    }
    validateInput() {
        return [];
    }
    work(params) {
        return new Promise((resolve, reject) => {
            try {
                let options = new EHRGateway_1.StoreContributionRequestOptions(params.token, params.committer, params.ehrId, params.mergedContribution);
                this.gatewayFactory.build(options).request().then((response) => {
                    const processVariables = new camunda_external_task_client_js_1.Variables();
                    processVariables.setTyped("storeContributionSuccess", {
                        value: response.code === 200,
                        type: "strings",
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
    }
}
exports.StoreContributionWorker = StoreContributionWorker;
//# sourceMappingURL=StoreContributionWorker.js.map