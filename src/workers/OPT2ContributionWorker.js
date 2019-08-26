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
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const OPTService_1 = require("../opt/OPTService");
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
let OPT2ContributionWorker = class OPT2ContributionWorker extends Worker_1.Worker {
    constructor(optService, workerLogger) {
        super(workerLogger);
        this.topic = "optToContribution";
        this.variableNames = ["template"];
        this.optService = optService;
    }
    validateInput() {
        return [];
    }
    work(params) {
        return new Promise((resolve, reject) => {
            this.optService.opt2Contribution(params.template).then((contribution) => {
                const processVariables = new camunda_external_task_client_js_1.Variables();
                processVariables.setTyped("contribution", {
                    value: contribution,
                    type: "xml",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new Worker_1.WorkResults(processVariables));
            }).catch((error) => {
                this.workerLogger.error(error);
                reject(new WorkerExceptions_1.OPTServiceFailureException({
                    option: "ingen",
                    error: error,
                    input: params.template
                }));
            });
        });
    }
};
OPT2ContributionWorker = __decorate([
    __param(0, inversify_1.inject(types_1.TYPES.OPTService)),
    __param(1, inversify_1.inject(types_1.TYPES.Logger)), __param(1, inversify_1.named("workerLogger")),
    __metadata("design:paramtypes", [OPTService_1.OPTService, Object])
], OPT2ContributionWorker);
exports.OPT2ContributionWorker = OPT2ContributionWorker;
//# sourceMappingURL=OPT2ContributionWorker.js.map