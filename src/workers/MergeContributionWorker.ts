import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import {inject, named} from "inversify";
import {TYPES} from "../di/types";
import {OPTService} from "../opt/OPTService";
import {Logger} from "../di/ThirdPartyTypes";

interface MergeContributionParams {
    answers: any;
    taggedContribution: string;
}

class MergeContributionWorker extends Worker {

    readonly topic = "mergeContribution";

    readonly variableNames = ["answers", "taggedContribution"];

    readonly optService: OPTService;

    constructor(
        @inject(TYPES.OPTService)optService: OPTService,
        @inject(TYPES.Logger) @named("workerLogger")workerLogger: Logger) {
        super(workerLogger);
        this.optService = optService;
    }

    validateInput(): InputValidationError[] {
        return [];
    }

    work(params: MergeContributionParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
            try {
                this.optService.mergeContribution(params.answers, params.taggedContribution).then((mergedContribution: string) => {
                    const processVariables = new Variables();
                    processVariables.setTyped("mergedContribution", {
                        value: mergedContribution,
                        type: "xml",
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

export {MergeContributionWorker}