import {Client, logger} from "camunda-external-task-client-js";
import {Worker} from "./Worker";
import {FetchTemplateWorker} from "./FetchTemplateWorker"

class WorkerClient {

    client: Client;

    constructor() {
        const config = {
            baseUrl: `${process.env.CAMUNDA_HOST}/engine-rest`,
            workerId: process.env.WORKER_ID,
            maxTasks: process.env.MAX_TASKS,
            maxParallelExecutions: process.env.MAX_PARALLEL_EXECUTIONS,
            interval: process.env.INTERVAL,
            lockDuration: process.env.LOCK_DURATION,
            use: logger
        };

        this.client = new Client(config);
        this.subscribeToTopics();
    }

    private getWorkers = function (): Worker[] {
        return [new FetchTemplateWorker()];
    };

    private subscribeToTopics() {
        this.getWorkers().forEach((worker) => {
            this.client.subscribe(worker.topic, worker.handle);
        })
    }
}