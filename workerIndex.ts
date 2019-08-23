//import {OPTService} from "./src/opt/OPTService";

import {OPTService} from "./src/opt/OPTService";

const utils = require("./src/handlers/utils");
const logger = require("./src/helpers/logger");
const routes = require("./src/routes");
import * as fs from "fs";
import * as restify from "restify";
import * as restifyRouter from "restify-router";
import * as corsMiddleware from "restify-cors-middleware";
import {TYPES} from "./src/di/types";
import container from "./src/di/inversify.config";

//import container from "./src/workers/di/inversify.config";
//import {WorkerClient} from "./src/workers/WorkerClient";
//import {TYPES} from "./src/workers/di/types";

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

router.add("", routes);
router.applyRoutes(server);

server.on('after', restify.plugins.metrics({server: server}, function onMetrics(err: any, metrics: any) {
    //logger.info(`${metrics.method} ${metrics.path} ${metrics.statusCode} ${metrics.latency} ms`);
    if (err) {
        logger.error(err);
    }
    logger.info(metrics);
}));

//server.on('uncaughtException', function (req, res, route, err) {
server.on('uncaughtException', function (err: any) {
    logger.error(err);
});

server.listen(process.env.PORT, function () {
    logger.info('%s listening at %s with %s', server.name, server.url, process.env.NODE_ENV);
});

//const workerClient = container.get <WorkerClient>(TYPES.WorkerClient);
//workerClient.startClient();

let opt = fs.readFileSync("./test/vital_signs_summary.en.v1.opt");

const optService: OPTService = container.get <OPTService>(TYPES.OPTService);
optService.opt2html(opt.toString('UTF-8')).then((result) => {
    console.log(result)
}).catch((error) => {
    console.log(error)
});