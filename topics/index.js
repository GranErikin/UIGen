const ehr = require('../workers/ehr');
const { Client, logger } = require("camunda-external-task-client-js");

const config = { baseUrl: `${process.env.CAMUNDA_HOST}/engine-rest`, use: logger };

const client = new Client(config);

let fetchTemplateWorker = new FetchTemplateWorker();

client.subscribe(fetchTemplateWorker.topic, fetchTemplateWorker.handle);
client.subscribe(fetchTemplateWorker.topic, fetchTemplateWorker.work);
client.subscribe(fetchTemplateWorker.topic, fetchTemplateWorker.work);