require("dotenv").config();
const fs = require("fs");
const restify = require("restify");
const router = new (require('restify-router')).Router();
const corsMiddleware = require("restify-cors-middleware");
const utils = require("./handlers/utils");
const logger = require("./helpers/logger");
const routes = require("./routes");
require("./topics");

const server = restify.createServer({
    name: "OPT Convertion Service",
    version: "1.0.0",
    log: logger
});

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: [],
    exposeHeaders: []
});
   
server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(utils.logRequestPayload);

router.add("",routes);
router.applyRoutes(server);

server.on('after', restify.plugins.metrics({ server: server }, function onMetrics(err, metrics) {
    //logger.info(`${metrics.method} ${metrics.path} ${metrics.statusCode} ${metrics.latency} ms`);
    logger.info(metrics);
}));

server.on('uncaughtException', function (req, res, route, err) {
	logger.error(err);
});

server.listen(process.env.PORT, function () {
    logger.info('%s listening at %s with %s', server.name, server.url, process.env.NODE_ENV);
});

module.exports = server;