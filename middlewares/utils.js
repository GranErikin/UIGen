const fs = require("fs");
const writeOpt = (req, res, next) => {

	let uid = req.params.uid;

	fs.writeFile(`./opt/${uid}.opt`, xml, function (err) {
        if (err) {
            console.error("WRITE ERROR");
            console.error(err);
            res.send({
                error: "Unable to write opt file",
                success: false
            });
            return next(err);
		}
		next();
	});

}

module.exports= {writeOpt};