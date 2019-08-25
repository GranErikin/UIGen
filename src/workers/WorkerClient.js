"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const camunda_external_task_client_js_1 = require("camunda-external-task-client-js");
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
let WorkerClient = class WorkerClient {
    constructor(workers) {
        this.workers = workers;
        const camundaClientConfig = {
            baseUrl: process.env.CAMUNDA_HOST ? `${process.env.CAMUNDA_HOST}/engine-rest` : "localhost:8080/engine-rest",
            workerId: process.env.WORKER_ID,
            maxTasks: process.env.MAX_TASKS ? parseInt(process.env.MAX_TASKS) : 10,
            maxParallelExecutions: parseInt(process.env.MAX_PARALLEL_EXECUTIONS ? process.env.MAX_PARALLEL_EXECUTIONS : "10"),
            interval: parseInt(process.env.INTERVAL ? process.env.INTERVAL : "2000"),
            lockDuration: parseInt(process.env.LOCK_DURATION ? process.env.LOCK_DURATION : "15000"),
            autoPoll: false,
            use: camunda_external_task_client_js_1.logger
        };
        this.client = new camunda_external_task_client_js_1.Client(camundaClientConfig);
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
        });
    }
};
WorkerClient = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.multiInject(types_1.TYPES.Worker)),
    __metadata("design:paramtypes", [Array])
], WorkerClient);
exports.WorkerClient = WorkerClient;
//# sourceMappingURL=WorkerClient.js.map