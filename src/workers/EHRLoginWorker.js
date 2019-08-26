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
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const BaseGateway_1 = require("../gateways/BaseGateway");
const EHRGateway_1 = require("../gateways/EHRGateway");
let EHRLoginWorker = class EHRLoginWorker extends Worker_1.Worker {
    constructor(ehrServerHost, ehrServerUN, ehrServerPWD, ehrServerOrg, requestOptionsFactory, gatewayFactory, workerLogger) {
        super(workerLogger);
        this.topic = "ehrLogin";
        this.variableNames = [];
        this.ehrServerUN = ehrServerUN;
        this.ehrServerPWD = ehrServerPWD;
        this.ehrServerOrg = ehrServerOrg;
        this.ehrServerHost = ehrServerHost;
        this.requestOptionsFactory = requestOptionsFactory;
        this.gatewayFactory = gatewayFactory;
    }
    validateInput() {
        return [];
    }
    work() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const ehrAuthenticateUrl = `${this.ehrServerHost}/login?username=${this.ehrServerUN}&password=${this.ehrServerPWD}&organization=${this.ehrServerOrg}&format=json`;
                let options = this.requestOptionsFactory.createOptions("", { 'Content-Type': 'application/json' }, ehrAuthenticateUrl);
                this.gatewayFactory.build(options).request().then((response) => {
                    const processVariables = new camunda_external_task_client_js_1.Variables();
                    processVariables.setTyped("token", {
                        value: response.body.token,
                        type: "string",
                        valueInfo: {
                            transient: true
                        }
                    });
                    resolve(new Worker_1.WorkResults(processVariables));
                }).catch((error) => {
                    this.workerLogger.error(error);
                    reject(new WorkerExceptions_1.ExternalResourceFailureException({
                        body: error.response.body,
                        error: error.error,
                        message: error.message,
                        uri: error.options.url,
                        statusCode: error.statusCode
                    }));
                });
            });
        });
    }
};
EHRLoginWorker = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.String)), __param(0, inversify_1.named("EHR_SERVER_HOST")),
    __param(1, inversify_1.inject(types_1.TYPES.String)), __param(1, inversify_1.named("EHR_SERVER_USERNAME")),
    __param(2, inversify_1.inject(types_1.TYPES.String)), __param(2, inversify_1.named("EHR_SERVER_PASSWORD")),
    __param(3, inversify_1.inject(types_1.TYPES.String)), __param(3, inversify_1.named("EHR_SERVER_ORGANIZATION")),
    __param(4, inversify_1.inject(types_1.TYPES.EHRLoginRequestOptionsFactory)),
    __param(5, inversify_1.inject(types_1.TYPES.GatewayFactory)),
    __param(6, inversify_1.inject(types_1.TYPES.Logger)), __param(6, inversify_1.named("workerLogger")),
    __metadata("design:paramtypes", [String, String, String, String, EHRGateway_1.EHRLoginRequestOptionsFactory,
        BaseGateway_1.GatewayFactory, Object])
], EHRLoginWorker);
exports.EHRLoginWorker = EHRLoginWorker;
//# sourceMappingURL=EHRLoginWorker.js.map