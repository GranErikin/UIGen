import {Worker, WorkResults} from "./Worker"
import {ExternalResourceFailureException, InputValidationError} from "./exceptions/WorkerExceptions";
import {Variables} from "camunda-external-task-client-js";
import {inject, named} from "inversify";
import {TYPES} from "../di/types";
import {OPTService} from "../opt/OPTService";
import {Logger} from "../di/ThirdPartyTypes";

interface OPT2HTMLParams {
    template: string;
}

class OPT2HTMLWorker extends Worker {

    readonly topic = "optToHtml";

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

    work(params: OPT2HTMLParams): Promise<WorkResults> {
        return new Promise<WorkResults>((resolve, reject) => {
            try {
                this.optService.opt2html(params.template).then((html: string) => {
                    const processVariables = new Variables();
                    processVariables.setTyped("html", {
                        value: html,
                        type: "string",
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