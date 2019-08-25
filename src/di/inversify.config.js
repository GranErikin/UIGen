"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const request = require("request-promise");
const nodeCache = require("node-cache");
const bunyan = require("bunyan");
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const isUUID = require("is-uuid");
const WorkerClient_1 = require("../workers/WorkerClient");
const FetchTemplateWorker_1 = require("../workers/FetchTemplateWorker");
const EHRLoginWorker_1 = require("../workers/EHRLoginWorker");
const OPT2HTMLWorker_1 = require("../workers/OPT2HTMLWorker");
const dotenv_1 = require("dotenv");
const EnvironmentVariableChecker_1 = require("../workers/EnvironmentVariableChecker");
const BaseGateway_1 = require("../gateways/BaseGateway");
const StoreContributionWorker_1 = require("../workers/StoreContributionWorker");
const uuid = require("uuid");
const fs = require("fs");
const child_process = require("child_process");
const xmldom_1 = require("xmldom");
const xpath = require("xpath");
const OPTService_1 = require("../opt/OPTService");
const moment = require("moment");
const async = require("async");
const ContributionMerger_1 = require("../opt/ContributionMerger");
const OPT2ContributionWorker_1 = require("../workers/OPT2ContributionWorker");
const ValidateContributionWorker_1 = require("../workers/ValidateContributionWorker");
const MergeContributionWorker_1 = require("../workers/MergeContributionWorker");
const EHRGateway_1 = require("../gateways/EHRGateway");
dotenv_1.config();
let serverLogger = bunyan.createLogger({
    name: 'OPT-Utils',
    streams: [{
            stream: process.stdout,
            level: 'info'
        }, {
            stream: process.stderr,
            level: 'error'
        }]
});
let gatewayLogger = bunyan.createLogger({
    name: 'Gateway',
    streams: [{
            stream: process.stdout,
            level: 'info'
        }, {
            stream: process.stderr,
            level: 'error'
        }]
});
let workerLogger = bunyan.createLogger({
    name: 'Worker',
    streams: [{
            stream: process.stdout,
            level: 'info'
        }, {
            stream: process.stderr,
            level: 'error'
        }]
});
const checker = new EnvironmentVariableChecker_1.EnvironmentVariableChecker(process.env);
checker.check();
const environmentVariables = new inversify_1.ContainerModule((bind) => {
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_HOST || '').whenTargetNamed("EHR_SERVER_HOST");
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_USERNAME || '').whenTargetNamed("EHR_SERVER_USERNAME");
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_PASSWORD || '').whenTargetNamed("EHR_SERVER_PASSWORD");
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_ORGANIZATION || '').whenTargetNamed("EHR_SERVER_ORGANIZATION");
});
const thirdPartyDependencies = new inversify_1.ContainerModule((bind) => {
    bind(types_1.TYPES.Request).toConstantValue(request);
    bind(types_1.TYPES.NodeCache).toConstantValue(nodeCache.prototype);
    bind(types_1.TYPES.Logger).toConstantValue(serverLogger).whenTargetNamed("serverLogger");
    bind(types_1.TYPES.Logger).toConstantValue(gatewayLogger).whenTargetNamed("gatewayLogger");
    bind(types_1.TYPES.Logger).toConstantValue(workerLogger).whenTargetNamed("workerLogger");
    bind(types_1.TYPES.CamundaLogger).toConstantValue(camunda_external_task_client_js_1.logger);
    bind(types_1.TYPES.IsUUID).toConstantValue(isUUID);
    bind(types_1.TYPES.UUID).toConstantValue(uuid);
    bind(types_1.TYPES.FS).toConstantValue(fs);
    bind(types_1.TYPES.EXEC).toConstantValue(child_process.execSync);
    bind(types_1.TYPES.DOMParser).toConstantValue(new xmldom_1.DOMParser());
    bind(types_1.TYPES.XMLSerializer).toConstantValue(new xmldom_1.XMLSerializer());
    bind(types_1.TYPES.Xpath).toConstantValue(xpath);
    bind(types_1.TYPES.Async).toConstantValue(async);
    bind(types_1.TYPES.Moment).toConstantValue(moment);
});
const applicationDependencies = new inversify_1.ContainerModule((bind) => {
    bind(types_1.TYPES.WorkerClient).to(WorkerClient_1.WorkerClient).inSingletonScope();
    bind(types_1.TYPES.Worker).to(EHRLoginWorker_1.EHRLoginWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(FetchTemplateWorker_1.FetchTemplateWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(OPT2HTMLWorker_1.OPT2HTMLWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(OPT2ContributionWorker_1.OPT2ContributionWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(ValidateContributionWorker_1.ValidateContributionWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(StoreContributionWorker_1.StoreContributionWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(MergeContributionWorker_1.MergeContributionWorker).inSingletonScope();
    bind(types_1.TYPES.GatewayFactory).to(BaseGateway_1.GatewayFactory).inSingletonScope();
    bind(types_1.TYPES.OPTService).to(OPTService_1.OPTService).inSingletonScope();
    bind(types_1.TYPES.ContributionMerger).to(ContributionMerger_1.ContributionMerger).inSingletonScope();
    bind(types_1.TYPES.RequestOptions).to(EHRGateway_1.EHRLoginRequestOptions).whenTargetNamed("ehrLogin");
    bind(types_1.TYPES.RequestOptions).to(EHRGateway_1.FetchTemplateRequestOptions).whenTargetNamed("fetchTemplate");
    bind(types_1.TYPES.RequestOptions).to(EHRGateway_1.StoreContributionRequestOptions).whenTargetNamed("storeContribution");
    bind(types_1.TYPES.EHRLoginRequestOptionsFactory).to(EHRGateway_1.EHRLoginRequestOptionsFactory);
    bind(types_1.TYPES.FetchTemplateRequestOptionsFactory).to(EHRGateway_1.FetchTemplateRequestOptionsFactory);
    bind(types_1.TYPES.StoreContributionRequestOptionsFactory).to(EHRGateway_1.StoreContributionRequestOptionsFactory);
    bind(types_1.TYPES.RequestOptionFactory).toFactory((context) => {
        return (named) => (body, headers, url) => {
            let options = context.container.getNamed(types_1.TYPES.RequestOptions, named);
            options.body = body;
            options.headers = headers;
            options.url = url;
            return options;
        };
    });
});
const container = new inversify_1.Container();
container.load(thirdPartyDependencies, applicationDependencies, environmentVariables);
exports.default = container;
//# sourceMappingURL=inversify.config.js.map