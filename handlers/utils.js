const fs = require("fs");
const utils = require("../helpers/utils");
const opt = require("../gateways/opt");
const fileUtils = require("../utils/file");

function writeFile (req, res, next) {
	let xml = req.body;
	req.params.filePath = fileUtils.writeTmpFileSync(xml);
	next();
}

function logRequestPayload (req, res, next) {
    if(["development","test"].includes(process.env.NODE_ENV)){
        console.log(req.body);
        console.log(req.params);
    }
    return next();
}

function validateInstance( req, res, next) {
	let path = req.params.filePath;
	opt.validateInstance(path,(err, response) => {
		let results = response.split('\n');
		results.pop();
		let code = 200;
		let data = {
			valid: true
		}
		if(results.shift().includes('NOT VALID')){
			data.valid=false;
			code=400;
			data['results'] = results
		}
		res.send(code, utils.buildRespose(true, data));
		next();
	});
}

module.exports= {writeFile, logRequestPayload, validateInstance};