const fs = require("fs");
const {exec} = require("child_process");
const merge = require("../handlers/merge-utils");

function opt2html(uid, cb) {
    exec(
        `java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main uigen ./opt/${uid}.opt ./html/${uid}.html`,
        (err, stdout, stderr) => {
            if (err) return cb(err);
            let contents = fs.readFileSync(`./html/${uid}.html`, "utf8");
            cb(null, contents);
        }
    );
}

function opt2contribution(uid, cb) {
    exec(
        `java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main ingen ./opt/${uid}.opt ./contribution/${uid}.xml 1 tagged`,
        (err, stdout, stderr) => {
            if (err) return cb(err);
            let contents = fs.readFileSync(`./contribution/${uid}.xml`, "utf8");
            cb(null, contents);
        }
    );
}

function mergeContribution(body, cb) {
    merge(body, cb);
}

module.exports = {opt2html, opt2contribution, mergeContribution};