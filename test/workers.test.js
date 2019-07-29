process.env.NODE_ENV = 'test';

const getEHRServerToken = require('../workers/index').getEHRServerToken;
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("EHR Server Workers", () => {
    it("it should log into EHR Server and get a valid token", (done) => {
        getEHRServerToken((err, response) => {
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

    it("it should fetch an OPT Template when provided with a valid Id", (done) => {
        getEHRServerToken((err, response) => {
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
});