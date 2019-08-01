const fs = require("fs");
const {exec} = require("child_process");
const merge = require("../handlers/merge-utils");

function opt2html(path, cb) {
    exec(
        `java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main uigen ${path}`,
        (err, stdout, stderr) => {
            if (err) return cb(err);
            cb(null, stdout);
        }
    );
}

function opt2contribution(path, cb) {
    exec(
		`java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main ingen ${path} 1 tagged`,
		(err, stdout, stderr) => {
			if (err) return cb(err);
			cb(null, stdout);
		}
	);
}

function validateInstance(path, cb) {
	exec(
		`java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main inval ${path}`,
		(err, stdout, stderr) => {
			if (err) return cb(err);
			cb(null, stdout);
		}
	);
}

function mergeContribution(body, cb) {
    merge(body, cb);
}

module.exports = {opt2html, opt2contribution, validateInstance, mergeContribution};