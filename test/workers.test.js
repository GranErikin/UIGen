process.env.NODE_ENV = 'test';

const getEHRServerToken = require('../gateways/ehr').getEHRServerToken;
const fetchOPTTemplate = require('../gateways/ehr').fetchOPTTemplate;
const chai = require("chai");
const chaiHttp = require("chai-http");
const xmlParser = require('libxmljs');
const fs = require('fs');

chai.use(chaiHttp);

describe("EHR Server Workers", () => {
    it("it should log into EHR Server and get a valid token", (done) => {
        getEHRServerToken((err, response) => {
            chai.assert(err === null, `Error : ${err}`);
            chai.assert.hasAllKeys(response, ["token"], 'Response does not contain key \"token\"');
            chai.assert(response.token.length > 270, 'Invalid token, < 270 characters');
            chai.request(process.env.EHR_SERVER_HOST)
                .get("/templates?format=json")
                .set('Authorization', `Bearer ${response.token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    }).timeout(10000);

    it("it should fetch a valid OPT Template when provided with a valid Id and a valid token", (done) => {
        getEHRServerToken((err, response) => {
            chai.assert.hasAllKeys(response, ["token"], 'Response does not contain key \"token\"');
            chai.assert(response.token.length > 270, 'Invalid token, < 270 characters');
            chai.request(process.env.EHR_SERVER_HOST)
                .get("/templates?format=json")
                .set('Authorization', `Bearer ${response.token}`)
                .end((err, resp) => {
                    resp.should.have.status(200);
                    fetchOPTTemplate(response.token, resp.body.templates[0].uid, (err, res) => {
                        chai.assert(err === null, `Error : ${err}`);
                        fs.readFile("test/opt.xsd", "utf8", function (readError, data) {
                            chai.assert(readError === null, `Error : ${readError}`);
                            let xsdDoc = xmlParser.parseXmlString(data);
                            let xmlDoc = xmlParser.parseXmlString(res);
                            let matchesSchema = xmlDoc.validate(xsdDoc);
                            chai.assert(matchesSchema, `Invalid OPT template, doesn't match schema`);
                            done();
                        });
                    });
                });
        });
    }).timeout(10000);
});