const converters = require('../workers/converters');
const { Client, logger } = require("camunda-external-task-client-js");

const config = { baseUrl: `${CAMUNDA_HOST}/engine-rest`, use: logger };

const client = new Client(config);

client.subscribe("creditScoreChecker", converters.opt2html);