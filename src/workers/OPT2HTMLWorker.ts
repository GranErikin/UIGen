import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {FetchTemplateRequestOptions} from "../gateways/EHRGateway";
import {Variables} from "camunda-external-task-client-js";

interface OPT2HTMLParams {
    template: string;
}

class OPT2HTMLWorker extends Worker {

    readonly topic = "opt2html";

    readonly variableNames = ["template"];

    validateInput(): InputValidationError[] {
        return [];
    }

    work(params: OPT2HTMLParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
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

export {OPT2HTMLWorker}