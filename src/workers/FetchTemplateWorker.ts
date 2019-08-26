import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import * as isUUID from "is-uuid";
import {FetchTemplateRequestOptions, FetchTemplateRequestOptionsFactory} from "../gateways/EHRGateway";
import {inject, injectable, named} from "inversify";
import {TYPES} from "../di/types";
import {GatewayFactory} from "../gateways/BaseGateway";
import {Logger} from "../di/ThirdPartyTypes";

interface FetchTemplateParams {
    token: string;
    templateId: string;
}

@injectable()
class FetchTemplateWorker extends Worker {

    topic = "fetchTemplate";

    variableNames = ["token", "templateId"];

    private readonly gatewayFactory: GatewayFactory;
    private readonly requestOptionsFactory: FetchTemplateRequestOptionsFactory;
    private readonly ehrServerHost: string;

    constructor(
        @inject(TYPES.String) @named("EHR_SERVER_HOST")ehrServerHost: string,
        @inject(TYPES.FetchTemplateRequestOptionsFactory) requestOptionsFactory: FetchTemplateRequestOptionsFactory,
        @inject(TYPES.GatewayFactory) gatewayFactory: GatewayFactory,
        @inject(TYPES.Logger) @named("workerLogger")workerLogger: Logger) {
        super(workerLogger);
        this.gatewayFactory = gatewayFactory;
        this.requestOptionsFactory = requestOptionsFactory;
        this.ehrServerHost = ehrServerHost;
    }

    validateInput(params: FetchTemplateParams): InputValidationError[] {
        const token = params.token;
        const tokenRegex = '^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$';
        const templateId = params.templateId;
        const errors = [];

        if (!token.match(tokenRegex)) {
            errors.push({
                variableName: "token",
                value: token,
                validationErrorMessage: "The token doesn't comply with JWT format, invalid token"
            })
        }

        if (!isUUID.v4(templateId)) {
            errors.push({
                variableName: "templateId",
                value: templateId,
                validationErrorMessage: "This template id doesn't comply with uuid v4 format, invalid uuid"
            })
        }
        return errors;
    }

    work(params: FetchTemplateParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject): void => {
            let fetchTemplateUrl = `${this.ehrServerHost}/templates/${params.templateId}`;
            let options: FetchTemplateRequestOptions = this.requestOptionsFactory.createOptions("", {
                'Accept': 'application/json, text/xml',
                'Authorization': `Bearer ${params.token}`
            }, fetchTemplateUrl);
            this.gatewayFactory.build<FetchTemplateRequestOptions>(options).request().then((response) => {
                const processVariables = new Variables();
                processVariables.setTyped("template", {
                    value: response.body,
                    type: "Xml",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new WorkResults(processVariables));
            }).catch((error) => {
                this.workerLogger.error(error);
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

export {FetchTemplateWorker}