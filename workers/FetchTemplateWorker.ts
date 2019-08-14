import {WorkResults} from './Workable';
import {injectable} from "inversify";
import {Worker} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {request} from "request-promise";
import {template} from "inversify/dts/utils/template";
import {Variables} from "camunda-external-task-client-js";

const ehrServerHost = process.env.EHR_SERVER_HOST;
const fetchOPTTemplateUrl = `${ehrServerHost}/templates/`;

@injectable()
export class FetchTemplateWorker extends Worker {

    topic = "fetchTemplate";

    parameterNames = ["token", "templateId"];

    validateInput(): InputValidationError[] {
        return [];
    }

    async work(): Promise<WorkResults> {
        return new Promise<WorkResults>(async (resolve, reject) => {
            try {
                let response = await FetchTemplateWorker.fetchOPTTemplate(this.params.token, this.params.templateId);
                const processVariables = new Variables();
                processVariables.setTyped("template", {
                    value: response.body,
                    type: "Xml",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve({processVariablesResult: processVariables});
            } catch (error) {
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
        return request(options);
    };

}