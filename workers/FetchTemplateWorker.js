"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var FetchTemplateWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const Worker_1 = require("./Worker");
const WorkerExceptions_1 = require("./exceptions/WorkerExceptions");
const request_promise_1 = require("request-promise");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const ehrServerHost = process.env.EHR_SERVER_HOST;
const fetchOPTTemplateUrl = `${ehrServerHost}/templates/`;
let FetchTemplateWorker = FetchTemplateWorker_1 = class FetchTemplateWorker extends Worker_1.Worker {
    constructor() {
        super(...arguments);
        this.topic = "fetchTemplate";
        this.parameterNames = ["token", "templateId"];
    }
    validateInput() {
        return [];
    }
    work() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let response = yield FetchTemplateWorker_1.fetchOPTTemplate(this.params.token, this.params.templateId);
                    const processVariables = new camunda_external_task_client_js_1.Variables();
                    processVariables.setTyped("template", {
                        value: response.body,
                        type: "Xml",
                        valueInfo: {
                            transient: true
                        }
                    });
                    resolve({ processVariablesResult: processVariables });
                }
                catch (error) {
                    reject(new WorkerExceptions_1.ExternalResourceFailureException({
                        body: error.response.body,
                        error: error.error,
                        message: error.message,
                        uri: error.options.uri,
                        statusCode: error.statusCode
                    }));
                }
            }));
        });
    }
    static fetchOPTTemplate(token, templateId) {
        let options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/xml',
                'Authorization': `Bearer ${token}`
            },
            uri: `${fetchOPTTemplateUrl}${templateId}`,
            resolveWithFullResponse: true
        };
        return request_promise_1.request(options);
    }
    ;
};
FetchTemplateWorker = FetchTemplateWorker_1 = __decorate([
    inversify_1.injectable()
], FetchTemplateWorker);
exports.FetchTemplateWorker = FetchTemplateWorker;
//# sourceMappingURL=FetchTemplateWorker.js.map