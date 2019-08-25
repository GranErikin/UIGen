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
Object.defineProperty(exports, "__esModule", { value: true });
const Worker_1 = require("./Worker");
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
const EHRGateway_1 = require("../gateways/EHRGateway");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const BaseGateway_1 = require("../gateways/BaseGateway");
let StoreContributionWorker = class StoreContributionWorker extends Worker_1.Worker {
    constructor(ehrServerHost, requestOptionsFactory, gatewayFactory, workerLogger) {
        super(workerLogger);
        this.topic = "storeContribution";
        this.variableNames = ["mergedContribution", "ehrId", "committer", "token"];
        this.ehrServerHost = ehrServerHost;
        this.gatewayFactory = gatewayFactory;
        this.requestOptionsFactory = requestOptionsFactory;
    }
    validateInput() {
        return [];
    }
    work(params) {
        return new Promise((resolve, reject) => {
            try {
                const storeContributionUrl = `${this.ehrServerHost}/ehrs/${params.ehrId}/compositions?auditCommitter=${params.committer}`;
                const options = this.requestOptionsFactory.createOptions(params.mergedContribution, {
                    'Accept': 'application/json, text/xml',
                    'Content-Type': 'application/xml',
                    'Authorization': `Bearer ${params.token}`
                }, storeContributionUrl);
                //params.token, params.committer, params.ehrId, params.mergedContribution);
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
};
StoreContributionWorker = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.String)), __param(0, inversify_1.named("EHR_SERVER_HOST")),
    __param(1, inversify_1.inject(types_1.TYPES.StoreContributionRequestOptionsFactory)),
    __param(2, inversify_1.inject(types_1.TYPES.GatewayFactory)),
    __param(3, inversify_1.inject(types_1.TYPES.Logger)), __param(3, inversify_1.named("workerLogger")),
    __metadata("design:paramtypes", [String, EHRGateway_1.StoreContributionRequestOptionsFactory,
        BaseGateway_1.GatewayFactory, Object])
], StoreContributionWorker);
exports.StoreContributionWorker = StoreContributionWorker;
//# sourceMappingURL=StoreContributionWorker.js.map