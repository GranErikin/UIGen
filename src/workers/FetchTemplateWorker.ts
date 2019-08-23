import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import * as isUUID from "is-uuid";
import {FetchTemplateRequestOptions} from "../gateways/EHRGateway";

interface FetchTemplateParams {
    token: string;
    templateId: string;
}

class FetchTemplateWorker extends Worker {

    topic = "fetchTemplate";

    variableNames = ["token", "templateId"];

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
            try {
                let options: FetchTemplateRequestOptions = new FetchTemplateRequestOptions(params.token, params.templateId);
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
                });
            } catch (error) {
                this.workerLogger.error(error);
                reject(new ExternalResourceFailureException({
                    body: error.response.body,
                    error: error.error,
                    message: error.message,
                    uri: error.options.uri,
                    statusCode: error.statusCode
                }));
            }
        });
    }

}

export {FetchTemplateWorker}