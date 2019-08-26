import {Worker, WorkResults} from "./Worker"
import {
    InputValidationError,
    OPTServiceFailureException
} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import {inject, named} from "inversify";
import {TYPES} from "../di/types";
import {OPTService} from "../opt/OPTService";
import {Logger} from "../di/ThirdPartyTypes";

interface MergeContributionParams {
    answers: any;
    contribution: string;
}

class MergeContributionWorker extends Worker {

    readonly topic = "mergeContribution";

    readonly variableNames = ["answers", "contribution"];

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
            this.optService.mergeContribution(params.answers, params.contribution).then((mergedContribution: string) => {
                const processVariables = new Variables();
                processVariables.setTyped("mergedContribution", {
                    value: mergedContribution,
                    type: "xml",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new WorkResults(processVariables));
            }).catch((error) => {
                this.workerLogger.error(error);
                reject(new OPTServiceFailureException({
                    option: "merge",
                    error: error,
                    input: JSON.stringify({"answers": params.answers, "contribution": params.contribution})
                }));
            });
        });
    }
}

export {MergeContributionWorker}