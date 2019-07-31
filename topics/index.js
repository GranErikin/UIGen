const converters = require('../workers/converters');
const { Client, logger } = require("camunda-external-task-client-js");

const config = { baseUrl: `${CAMUNDA_HOST}/engine-rest`, use: logger };

const client = new Client(config);

client.subscribe("opt2html", converters.opt2html);
client.subscribe("opt2contribution", converters.opt2contribution);
client.subscribe("opt2bundle", converters.opt2);
client.subscribe("validateInstance", converters.opt2html);