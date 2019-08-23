import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import {EHRAuthenticateRequestOptions} from "../gateways/EHRGateway";

class EHRLoginWorker extends Worker {

    topic = "ehrLogin";

    variableNames = [];

    validateInput(): InputValidationError[] {
        return [];
    }

    async work(): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject): void => {
            try {
                let options: EHRAuthenticateRequestOptions = new EHRAuthenticateRequestOptions();
                this.gatewayFactory.build<EHRAuthenticateRequestOptions>(options).request().then((response) => {
                    const processVariables = new Variables();
                    processVariables.setTyped("token", {
                        value: response.body.token,
                        type: "string",
                        valueInfo: {
                            transient: true
                        }
                    });
                    resolve(new WorkResults(processVariables, undefined));
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

export {EHRLoginWorker}