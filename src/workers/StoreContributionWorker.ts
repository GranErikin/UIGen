import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {
    StoreContributionRequestOptions,
    StoreContributionRequestOptionsFactory
} from "../gateways/EHRGateway";
import {Variables} from "camunda-external-task-client-js";
import {inject, injectable, named} from "inversify";
import {TYPES} from "../di/types";
import {GatewayFactory} from "../gateways/BaseGateway";
import {Logger} from "../di/ThirdPartyTypes";

interface StoreContributionParams {
    token: string;
    mergedContribution: string;
    committer: string;
    ehrId: string;
}

@injectable()
class StoreContributionWorker extends Worker {
    readonly topic = "storeContribution";
    readonly variableNames = ["mergedContribution", "ehrId", "committer", "token"];
    private requestOptionsFactory: StoreContributionRequestOptionsFactory;
    private readonly gatewayFactory: GatewayFactory;
    private readonly ehrServerHost: string;

    constructor(
        @inject(TYPES.String) @named("EHR_SERVER_HOST") ehrServerHost: string,
        @inject(TYPES.StoreContributionRequestOptionsFactory) requestOptionsFactory: StoreContributionRequestOptionsFactory,
        @inject(TYPES.GatewayFactory) gatewayFactory: GatewayFactory,
        @inject(TYPES.Logger) @named("workerLogger")workerLogger: Logger) {
        super(workerLogger);
        this.ehrServerHost = ehrServerHost;
        this.gatewayFactory = gatewayFactory;
        this.requestOptionsFactory = requestOptionsFactory;
    }

    validateInput(): InputValidationError[] {
        return [];
    }

    work(params: StoreContributionParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
            const storeContributionUrl = `${this.ehrServerHost}/ehrs/${params.ehrId}/compositions?auditCommitter=${encodeURI(params.committer)}`;
            const options: StoreContributionRequestOptions = this.requestOptionsFactory.createOptions(params.mergedContribution,
                {
                    'Accept': 'application/json, text/xml',
                    'Content-Type': 'application/xml',
                    'Authorization': `Bearer ${params.token}`
                }, storeContributionUrl);
            //params.token, params.committer, params.ehrId, params.mergedContribution);
            this.gatewayFactory.build<StoreContributionRequestOptions>(options).request().then((response) => {
                const processVariables = new Variables();
                processVariables.setTyped("storeContributionSuccess", {
                    value: response.code === 200,
                    type: "string",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new WorkResults(processVariables, undefined));
            }).catch((error) => {
                this.workerLogger.error(error);
                reject(new ExternalResourceFailureException({
                    body: options.body,
                    error: error.error,
                    message: error.message,
                    uri: error.options.url,
                    statusCode: error.statusCode
                }));
            })
        })
    }

}

export {StoreContributionWorker}