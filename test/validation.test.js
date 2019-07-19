process.env.NODE_ENV = 'test';

const fs = require("fs")
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

chai.use(chaiHttp);

let instance = fs.readFileSync("./test/instance.xml");
let instanceError = fs.readFileSync("./test/instance.error.xml");

//TODO: Implement file creation validation
describe("/POST validate/instance", () => {
    it("XML should be NOT VALID", (done) => {
        chai.request(server)
            .post("/validate/instance/testuid")
            .set('Content-Type', 'application/xml')
            .send(instanceError)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a("object");
				res.body.should.to.have.all.keys(["success","data"]);
				res.body.data.should.to.have.all.keys(["valid","results"]);
				res.body.success.should.to.equal(true);
				res.body.data.valid.should.to.equal(false);
				res.body.data.results.should.be.a("array");
                done();
          });
    });
    it("XML should be VALID", (done) => {
        chai.request(server)
            .post("/validate/instance/testuid")
            .set('Content-Type', 'application/xml')
            .send(instance)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
				res.body.should.to.have.all.keys(["success","data"]);
				res.body.data.should.to.have.all.keys(["valid"]);
				res.body.success.should.to.equal(true);
				res.body.data.valid.should.to.equal(true);
                done();
          });
    });
});