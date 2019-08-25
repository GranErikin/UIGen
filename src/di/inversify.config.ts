import "reflect-metadata";
import {Container, ContainerModule, interfaces} from "inversify";
import {TYPES} from "./types";
import {
    Request,
    NodeCache,
    Logger,
    CamundaLogger,
    IsUUID,
    UUID, FS, EXEC,
    _DOMParser, _XMLSerializer, XPath,
    Moment, Async
} from "./ThirdPartyTypes";

import * as request from "request-promise";
import * as nodeCache from "node-cache";
import * as bunyan from "bunyan";
import {logger} from "camunda-external-task-client-js";
import * as isUUID from "is-uuid";
import {WorkerClient} from "../workers/WorkerClient";
import {Worker} from "../workers/Worker";
import {FetchTemplateWorker} from "../workers/FetchTemplateWorker";
import {EHRLoginWorker} from "../workers/EHRLoginWorker";
import {OPT2HTMLWorker} from "../workers/OPT2HTMLWorker";
import {config} from "dotenv";
import {EnvironmentVariableChecker} from "../workers/EnvironmentVariableChecker";
import {GatewayFactory, RequestOptions} from "../gateways/BaseGateway";
import {StoreContributionWorker} from "../workers/StoreContributionWorker";
import * as uuid from "uuid";
import * as fs from "fs";
import * as child_process from "child_process";
import {DOMParser, XMLSerializer} from "xmldom";
import * as xpath from "xpath";
import {OPTService} from "../opt/OPTService";
import * as moment from "moment";
import * as async from "async";
import {ContributionMerger} from "../opt/ContributionMerger";
import {OPT2ContributionWorker} from "../workers/OPT2ContributionWorker";
import {ValidateContributionWorker} from "../workers/ValidateContributionWorker";
import {MergeContributionWorker} from "../workers/MergeContributionWorker";
import {
    EHRLoginRequestOptions,
    EHRLoginRequestOptionsFactory,
    FetchTemplateRequestOptions,
    FetchTemplateRequestOptionsFactory,
    StoreContributionRequestOptions,
    StoreContributionRequestOptionsFactory
} from "../gateways/EHRGateway";

config();
let serverLogger: Logger = bunyan.createLogger({
    name: 'OPT-Utils',
    streams: [{
        stream: process.stdout,
        level: 'info'
    }, {
        stream: process.stderr,
        level: 'error'
    }]
});

let gatewayLogger: Logger = bunyan.createLogger({
    name: 'Gateway',
    streams: [{
        stream: process.stdout,
        level: 'info'
    }, {
        stream: process.stderr,
        level: 'error'
    }]
});

let workerLogger: Logger = bunyan.createLogger({
    name: 'Worker',
    streams: [{
        stream: process.stdout,
        level: 'info'
    }, {
        stream: process.stderr,
        level: 'error'
    }]
});

const checker: EnvironmentVariableChecker = new EnvironmentVariableChecker(process.env);
checker.check();

const environmentVariables = new ContainerModule((bind) => {
    bind<string>(TYPES.String).toConstantValue(process.env.EHR_SERVER_HOST || '').whenTargetNamed("EHR_SERVER_HOST");
    bind<string>(TYPES.String).toConstantValue(process.env.EHR_SERVER_USERNAME || '').whenTargetNamed("EHR_SERVER_USERNAME");
    bind<string>(TYPES.String).toConstantValue(process.env.EHR_SERVER_PASSWORD || '').whenTargetNamed("EHR_SERVER_PASSWORD");
    bind<string>(TYPES.String).toConstantValue(process.env.EHR_SERVER_ORGANIZATION || '').whenTargetNamed("EHR_SERVER_ORGANIZATION");
});

const thirdPartyDependencies = new ContainerModule((bind) => {
    bind<Request>(TYPES.Request).toConstantValue(request);
    bind<NodeCache>(TYPES.NodeCache).toConstantValue(nodeCache.prototype);
    bind<Logger>(TYPES.Logger).toConstantValue(serverLogger).whenTargetNamed("serverLogger");
    bind<Logger>(TYPES.Logger).toConstantValue(gatewayLogger).whenTargetNamed("gatewayLogger");
    bind<Logger>(TYPES.Logger).toConstantValue(workerLogger).whenTargetNamed("workerLogger");
    bind<CamundaLogger>(TYPES.CamundaLogger).toConstantValue(logger);
    bind<IsUUID>(TYPES.IsUUID).toConstantValue(isUUID);
    bind<UUID>(TYPES.UUID).toConstantValue(uuid);
    bind<FS>(TYPES.FS).toConstantValue(fs);
    bind<EXEC>(TYPES.EXEC).toConstantValue(child_process.execSync);
    bind<_DOMParser>(TYPES.DOMParser).toConstantValue(new DOMParser());
    bind<_XMLSerializer>(TYPES.XMLSerializer).toConstantValue(new XMLSerializer());
    bind<XPath>(TYPES.Xpath).toConstantValue(xpath);
    bind<Async>(TYPES.Async).toConstantValue(async);
    bind<Moment>(TYPES.Moment).toConstantValue(moment);
});

const applicationDependencies = new ContainerModule((bind) => {
    bind<WorkerClient>(TYPES.WorkerClient).to(WorkerClient).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(EHRLoginWorker).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(FetchTemplateWorker).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(OPT2HTMLWorker).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(OPT2ContributionWorker).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(ValidateContributionWorker).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(StoreContributionWorker).inSingletonScope();
    bind<Worker>(TYPES.Worker).to(MergeContributionWorker).inSingletonScope();
    bind<GatewayFactory>(TYPES.GatewayFactory).to(GatewayFactory).inSingletonScope();
    bind<OPTService>(TYPES.OPTService).to(OPTService).inSingletonScope();
    bind<ContributionMerger>(TYPES.ContributionMerger).to(ContributionMerger).inSingletonScope();

    bind<RequestOptions>(TYPES.RequestOptions).to(EHRLoginRequestOptions).whenTargetNamed("ehrLogin");
    bind<RequestOptions>(TYPES.RequestOptions).to(FetchTemplateRequestOptions).whenTargetNamed("fetchTemplate");
    bind<RequestOptions>(TYPES.RequestOptions).to(StoreContributionRequestOptions).whenTargetNamed("storeContribution");

    bind<EHRLoginRequestOptionsFactory>(TYPES.EHRLoginRequestOptionsFactory).to(EHRLoginRequestOptionsFactory);
    bind<FetchTemplateRequestOptionsFactory>(TYPES.FetchTemplateRequestOptionsFactory).to(FetchTemplateRequestOptionsFactory);
    bind<StoreContributionRequestOptionsFactory>(TYPES.StoreContributionRequestOptionsFactory).to(StoreContributionRequestOptionsFactory);

    bind<interfaces.Factory<RequestOptions>>(TYPES.RequestOptionFactory).toFactory<RequestOptions>((context) => {
        return (named: string) => (body: any, headers: any, url: string) => {
            let options = context.container.getNamed<RequestOptions>(TYPES.RequestOptions, named);
            options.body = body;
            options.headers = headers;
            options.url = url;
            return options;
        };
    });

});

const container = new Container();
container.load(thirdPartyDependencies, applicationDependencies, environmentVariables);

export default container;