import {Client as CamundaClient, logger} from "camunda-external-task-client-js";
import {Worker} from "./Worker";
import {injectable, multiInject} from "inversify";
import {TYPES} from "../di/types";


@injectable()
class WorkerClient {

    private client: CamundaClient;
    private workers: Worker[];

    constructor(
        @multiInject(TYPES.Worker) workers: Worker[]) {
        this.workers = workers;
        const camundaClientConfig = {
            baseUrl: process.env.CAMUNDA_HOST ? `${process.env.CAMUNDA_HOST}/engine-rest` : "localhost:8080/engine-rest",
            workerId: process.env.WORKER_ID,
            maxTasks: process.env.MAX_TASKS ? parseInt(process.env.MAX_TASKS) : 10,
            maxParallelExecutions: parseInt(process.env.MAX_PARALLEL_EXECUTIONS ? process.env.MAX_PARALLEL_EXECUTIONS : "10"),
            interval: parseInt(process.env.INTERVAL ? process.env.INTERVAL : "2000"),
            lockDuration: parseInt(process.env.LOCK_DURATION ? process.env.LOCK_DURATION : "15000"),
            autoPoll: false,
            use: logger
        };
        this.client = new CamundaClient(camundaClientConfig);
    }

    startClient() {
        this.subscribeToTopics();
        this.client.start();
    }

    stopClient() {
        this.client.stop();
    }

    subscribeToTopics() {
        this.workers.forEach((worker) => {
            console.log(`Subscribing to topic -> ${worker.topic}`);
            this.client.subscribe(worker.topic, worker.handle.bind(worker));
        })
    }
}

export {WorkerClient}