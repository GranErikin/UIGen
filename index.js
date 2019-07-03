require('dotenv').config();
const restify = require('restify');
const fs = require("fs");
const {exec} = require('child_process');

const server = restify.createServer({
    name: 'UiGen',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.post('/transient', [], function (req, res, next) {

    console.log(req.params);
    console.log(req.body);

    res.send({
        message: "DATA SAVED"
    });

    next();
});

server.post('/ui/opt2json/:uid', [], function (req, res, next) {

    let uid = req.params.uid;
    let xml = req.body.slice(1);

    fs.writeFile(`./opt/${uid}.opt`, xml, function (err) {
        if (err) {
            console.log("WRITE ERROR");
            console.log(err);
            res.send({
                error: "Unable to write opt file",
                success: false
            });
            return next(err);
        }

        exec(`java -cp "./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar" com.cabolabs.openehr.opt.Main uigen ${uid} ./html`, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return next(err);
            }

            let contents = fs.readFileSync(`./html/${uid}.html`, 'utf8');
            res.send({
                data: {
                    html: contents
                },
                success: true
            });
            next();
        });
    });
});

server.listen(process.env.UIGEN_PORT, function () {
    console.log('%s listening at %s', server.name, server.url);
});