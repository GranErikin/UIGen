"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const FetchTemplateWorker_1 = require("./FetchTemplateWorker");
class WorkerClient {
    constructor() {
        this.getWorkers = function () {
            return [new FetchTemplateWorker_1.FetchTemplateWorker()];
        };
        const config = {
            baseUrl: `${process.env.CAMUNDA_HOST}/engine-rest`,
            workerId: process.env.WORKER_ID,
            maxTasks: process.env.MAX_TASKS,
            maxParallelExecutions: process.env.MAX_PARALLEL_EXECUTIONS,
            interval: process.env.INTERVAL,
            lockDuration: process.env.LOCK_DURATION,
            use: camunda_external_task_client_js_1.logger
        };
        this.client = new camunda_external_task_client_js_1.Client(config);
        this.subscribeToTopics();
    }
    subscribeToTopics() {
        this.getWorkers().forEach((worker) => {
            this.client.subscribe(worker.topic, worker.handle);
        });
    }
}
//# sourceMappingURL=WorkerClient.js.map