import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import {inject, injectable, named} from "inversify";
import {TYPES} from "../di/types";
import {GatewayFactory} from "../gateways/BaseGateway";
import {Logger} from "../di/ThirdPartyTypes";
import {EHRLoginRequestOptions, EHRLoginRequestOptionsFactory} from "../gateways/EHRGateway";

@injectable()
class EHRLoginWorker extends Worker {

    topic = "ehrLogin";
    variableNames = [];

    requestOptionsFactory: EHRLoginRequestOptionsFactory;
    private readonly gatewayFactory: GatewayFactory;
    private readonly ehrServerHost: string;
    private readonly ehrServerUN: string;
    private readonly ehrServerPWD: string;
    private readonly ehrServerOrg: string;

    constructor(
        @inject(TYPES.String) @named("EHR_SERVER_HOST") ehrServerHost: string,
        @inject(TYPES.String) @named("EHR_SERVER_USERNAME") ehrServerUN: string,
        @inject(TYPES.String) @named("EHR_SERVER_PASSWORD") ehrServerPWD: string,
        @inject(TYPES.String) @named("EHR_SERVER_ORGANIZATION") ehrServerOrg: string,
        @inject(TYPES.EHRLoginRequestOptionsFactory)requestOptionsFactory: EHRLoginRequestOptionsFactory,
        @inject(TYPES.GatewayFactory) gatewayFactory: GatewayFactory,
        @inject(TYPES.Logger) @named("workerLogger")workerLogger: Logger) {
        super(workerLogger);
        this.ehrServerUN = ehrServerUN;
        this.ehrServerPWD = ehrServerPWD;
        this.ehrServerOrg = ehrServerOrg;
        this.ehrServerHost = ehrServerHost;
        this.requestOptionsFactory = requestOptionsFactory;
        this.gatewayFactory = gatewayFactory;
    }

    validateInput(): InputValidationError[] {
        return [];
    }

    async work(): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject): void => {
            const ehrAuthenticateUrl = `${this.ehrServerHost}/login?username=${this.ehrServerUN}&password=${this.ehrServerPWD}&organization=${this.ehrServerOrg}&format=json`;
            let options: EHRLoginRequestOptions = this.requestOptionsFactory.createOptions({}, {'Content-Type': 'application/json'}, ehrAuthenticateUrl);
            this.gatewayFactory.build<EHRLoginRequestOptions>(options).request().then((response) => {
                const processVariables = new Variables();
                processVariables.setTyped("token", {
                    value: response.body.token,
                    type: "string",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new WorkResults(processVariables, undefined));
            }).catch((error) => {
                console.log(error);
                reject(new ExternalResourceFailureException({
                    body: error.response.body,
                    error: error.error,
                    message: error.message,
                    uri: error.options.url,
                    statusCode: error.statusCode
                }));
            });
        });
    }
}

export {EHRLoginWorker}