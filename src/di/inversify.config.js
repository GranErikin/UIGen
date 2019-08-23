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
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_HOST || '').whenTargetTagged("name", "EHR_SERVER_HOST");
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_USERNAME || '').whenTargetTagged("name", "EHR_SERVER_USERNAME");
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_PASSWORD || '').whenTargetTagged("name", "EHR_SERVER_PASSWORD");
    bind(types_1.TYPES.String).toConstantValue(process.env.EHR_SERVER_ORGANIZATION || '').whenTargetTagged("name", "EHR_SERVER_ORGANIZATION");
});
const thirdPartyDependencies = new inversify_1.ContainerModule((bind) => {
    bind(types_1.TYPES.Request).toConstantValue(request);
    bind(types_1.TYPES.NodeCache).toConstantValue(nodeCache.prototype);
    bind(types_1.TYPES.Logger).toConstantValue(serverLogger).whenTargetTagged("name", "serverLogger");
    bind(types_1.TYPES.Logger).toConstantValue(gatewayLogger).whenTargetTagged("name", "gatewayLogger");
    bind(types_1.TYPES.Logger).toConstantValue(workerLogger).whenTargetTagged("name", "workerLogger");
    bind(types_1.TYPES.CamundaLogger).toConstantValue(camunda_external_task_client_js_1.logger);
    bind(types_1.TYPES.IsUUID).toConstantValue(isUUID);
    bind(types_1.TYPES.UUID).toConstantValue(uuid);
    bind(types_1.TYPES.FS).toConstantValue(fs);
    bind(types_1.TYPES.EXEC).toConstantValue(child_process.execSync);
    bind(types_1.TYPES.DOMParser).toConstantValue(new xmldom_1.DOMParser());
    bind(types_1.TYPES.XMLSerializer).toConstantValue(new xmldom_1.XMLSerializer());
    bind(types_1.TYPES.Xpath).toConstantValue(xpath);
});
const applicationDependencies = new inversify_1.ContainerModule((bind) => {
    bind(types_1.TYPES.WorkerClient).to(WorkerClient_1.WorkerClient).inSingletonScope();
    bind(types_1.TYPES.Worker).to(FetchTemplateWorker_1.FetchTemplateWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(EHRLoginWorker_1.EHRLoginWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(OPT2HTMLWorker_1.OPT2HTMLWorker).inSingletonScope();
    bind(types_1.TYPES.Worker).to(StoreContributionWorker_1.StoreContributionWorker).inSingletonScope();
    bind(types_1.TYPES.GatewayFactory).to(BaseGateway_1.GatewayFactory).inSingletonScope();
    bind(types_1.TYPES.OPTService).to(OPTService_1.OPTService).inSingletonScope();
});
const container = new inversify_1.Container();
container.load(thirdPartyDependencies, applicationDependencies, environmentVariables);
exports.default = container;
//# sourceMappingURL=inversify.config.js.map