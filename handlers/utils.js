const fs = require("fs");
const utils = require("../helpers/utils");
const opt = require("../gateways/opt");
function writeFile (req, res, next) {

	let uid = req.params.uid = Math.random().toString(36).slice(2);
	let xml = req.body;

	fs.writeFile(`./${req.fileType}/${uid}.xml`, xml, function (err) {
        if (err) {
            res.send(500, utils.buildRespose(false, null, "ERROR_FILE_WRITE"));
            return next(err);
		}
		next();
	});

};

function logRequestPayload (req, res, next) {
    if(["development","test"].includes(process.env.NODE_ENV)){
        console.log(req.body);
        console.log(req.params);
    }
    return next();
}

function validateInstance( req, res, next) {
	let uid = req.params.uid;
	opt.validateInstance(uid,(err, response) => {
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