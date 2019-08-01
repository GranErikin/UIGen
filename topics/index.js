const converters = require('../workers/converters');
const utils = require('../workers/utils');
const { Client, logger } = require('camunda-external-task-client-js');

const config = { baseUrl: `${process.env.CAMUNDA_HOST}/engine-rest` };

const client = new Client(config);

client.subscribe('test', utils.debug);
client.subscribe('opt2html', converters.opt2html);
/*client.subscribe('opt2contribution', converters.opt2contribution);
client.subscribe('opt2bundle', converters.opt2);
client.subscribe('validateInstance', converters.opt2html);*/