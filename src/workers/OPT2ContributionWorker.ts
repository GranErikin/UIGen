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

interface OPT2Contribution {
    template: string;
}

class OPT2ContributionWorker extends Worker {

    readonly topic = "optToContribution";

    readonly variableNames = ["template"];

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

    work(params: OPT2Contribution): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
            this.optService.opt2Contribution(params.template).then((contribution: string) => {
                const processVariables = new Variables();
                processVariables.setTyped("contribution", {
                    value: contribution,
                    type: "xml",
                    valueInfo: {
                        transient: true
                    }
                });
                resolve(new WorkResults(processVariables));
            }).catch((error) => {
                this.workerLogger.error(error);
                reject(new OPTServiceFailureException({
                    option: "ingen",
                    error: error,
                    input: params.template
                }));
            });
        });
    }

}

export {OPT2ContributionWorker}