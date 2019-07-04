const fs = require("fs");
const { exec } = require("child_process");

const opt2html = (req, res, next) => {
	let uid = req.params.uid;
	exec(
		`java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main uigen ${uid} ./html`,
		(err, stdout, stderr) => {
			if (err) {
				console.log(err);
				return next(err);
			}

			let contents = fs.readFileSync(`./html/${uid}.html`, "utf8");
			res.send({
				data: {
					html: contents
				},
				success: true
			});
			next();
		}
	);
};

const opt2version = (req, res, next) => {
	let uid = req.params.uid;

	exec(
		`java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main ingen ${uid} ./version`,
		(err, stdout, stderr) => {
			if (err) {
				console.log(err);
				return next(err);
			}

			let contents = fs.readFileSync(`./html/${uid}.html`, "utf8");
			res.send({
				data: {
					html: contents
				},
				success: true
			});
			next();
		}
	);
};

module.exports = { opt2html, opt2version };
