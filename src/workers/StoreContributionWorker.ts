import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {StoreContributionRequestOptions} from "../gateways/EHRGateway";
import {Variables} from "camunda-external-task-client-js";

interface StoreContributionParams {
    token: string;
    mergedContribution: string;
    committer: string;
    ehrId: string;
}

class StoreContributionWorker extends Worker {
    readonly topic = "storeContribution";
    readonly variableNames = ["mergedContribution", "ehrId", "committer", "token"];

    validateInput(): InputValidationError[] {
        return [];
    }

    work(params: StoreContributionParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
            try {
                let options: StoreContributionRequestOptions = new StoreContributionRequestOptions(params.token, params.committer, params.ehrId, params.mergedContribution);
                this.gatewayFactory.build<StoreContributionRequestOptions>(options).request().then((response) => {
                    const processVariables = new Variables();
                    processVariables.setTyped("storeContributionSuccess", {
                        value: response.code === 200,
                        type: "strings",
                        valueInfo: {
                            transient: true
                        }
                    });
                    resolve(new WorkResults(processVariables, undefined));
                })
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
        })
    }

}

export {StoreContributionWorker}