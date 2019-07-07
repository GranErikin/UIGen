const fs = require("fs");
const utils = require("../helpers/utils");
function writeOpt (req, res, next) {

	let uid = req.params.uid;
	let xml = req.body;

	fs.writeFile(`./opt/${uid}.opt`, xml, function (err) {
        if (err) {
            res.send(500, utils.buildRespose(false, null, "ERROR_OPT_WRITE"));
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

module.exports= {writeOpt, logRequestPayload};