import {Worker, WorkResults} from "./Worker"
import {
    InputValidationError,
    OPTServiceFailureException
} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import {OPTService} from "../opt/OPTService";
import {inject, named} from "inversify";
import {TYPES} from "../di/types";
import {Logger} from "../di/ThirdPartyTypes";

interface ValidateContributionParams {
    mergedContribution: string;
}

class ValidateContributionWorker extends Worker {
    readonly topic = "validateContribution";
    readonly variableNames = ["mergedContribution"];

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

    work(params: ValidateContributionParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
            this.optService.validateInstance(params.mergedContribution).then((isValid: boolean) => {
                const processVariables = new Variables();
                processVariables.setTyped("isContributionValid", {
                    value: isValid,
                    type: "boolean",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new WorkResults(processVariables));
            }).catch((error) => {
                this.workerLogger.error(error);
                reject(new OPTServiceFailureException({
                    option: "inval",
                    error: error,
                    input: params.mergedContribution
                }));
            });
        });
    }

}

export {ValidateContributionWorker}