require("dotenv").config();
const restify = require("restify");
const converters = require("./middlewares/converters");
const utils = require("./middlewares/utils");

const server = restify.createServer({
	name: "UiGen",
	version: "1.0.0"
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.post("/transient", function(req, res, next) {
	console.log(req.params);
	console.log(req.body);

	res.send({
		message: "DATA SAVED"
	});

	next();
});

server.post("/opt2html/:uid", [utils.writeOpt, converters.opt2html]);
server.post("/opt2version/:uid", [utils.writeOpt, converters.opt2version]);

server.listen(process.env.UIGEN_PORT, function() {
	console.log("%s listening at %s", server.name, server.url);
});
