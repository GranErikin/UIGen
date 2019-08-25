"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./src/handlers/utils");
const logger = require("./src/helpers/logger");
const routes = require("./src/routes");
const fs = require("fs");
const restify = require("restify");
const restifyRouter = require("restify-router");
const corsMiddleware = require("restify-cors-middleware");
const types_1 = require("./src/di/types");
const inversify_config_1 = require("./src/di/inversify.config");
const router = new restifyRouter.Router();
const server = restify.createServer({
    name: "OPT-Utils",
    version: "1.0.0",
    log: logger
});
const folders = ['opt', 'instance'];
folders.forEach((folder) => {
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);
});
const cors = corsMiddleware({
    preflightMaxAge: 5,
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
router.add("", routes);
router.applyRoutes(server);
server.on('after', restify.plugins.metrics({ server: server }, function onMetrics(err, metrics) {
    //logger.info(`${metrics.method} ${metrics.path} ${metrics.statusCode} ${metrics.latency} ms`);
    if (err) {
        logger.error(err);
    }
    logger.info(metrics);
}));
//server.on('uncaughtException', function (req, res, route, err) {
server.on('uncaughtException', function (err) {
    logger.error(err);
});
server.listen(process.env.PORT, function () {
    logger.info('%s listening at %s with %s', server.name, server.url, process.env.NODE_ENV);
});
const workerClient = inversify_config_1.default.get(types_1.TYPES.WorkerClient);
workerClient.startClient();
//const test = container.getAll<Worker>(TYPES.Worker);
//console.log(test[0].requestOptionsFactory.createOptions({}, {}, "hey"));
//# sourceMappingURL=workerIndex.js.map