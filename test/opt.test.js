process.env.NODE_ENV = 'test';

const fs = require("fs")
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
chai.should();

chai.use(chaiHttp);

let opt = fs.readFileSync("./test/vital_signs_summary.en.v1.opt");

describe("/POST opt2html", () => {
    it("it should convert the opt to HTML form", (done) => {
        chai.request(server)
            .post("/opt2html/testuid")
            .set('Content-Type', 'application/xml')
            .send(opt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.to.have.all.keys(["success","data"]);
                res.body.success.should.to.equal(true);
                res.body.data.should.to.have.all.keys(["html"]);
                res.body.data.html.should.to.be.a("string");
                done();
          });
    });
});

describe("/POST opt2contribution", () => {
    it("it should convert the opt to XML Tagged Contribution", (done) => {
        chai.request(server)
            .post("/opt2contribution/testuid")
            .set('Content-Type', 'application/xml')
            .send(opt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.to.have.all.keys(["success","data"]);
                res.body.success.should.to.equal(true);
                res.body.data.should.to.have.all.keys(["contribution"]);
                res.body.data.contribution.should.to.be.a("string");
                done();
          });
    });
});

describe("/POST opt2bundle", () => {
    it("it should convert the opt to HTML form and XML Tagged Contribution", (done) => {
        chai.request(server)
            .post("/opt2bundle/testuid")
            .set('Content-Type', 'application/xml')
            .send(opt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.to.have.all.keys(["success","data"]);
                res.body.success.should.to.equal(true);
                res.body.data.should.to.have.all.keys(["html","contribution"]);
                res.body.data.html.should.to.be.a("string");
                res.body.data.contribution.should.to.be.a("string");
                done();
          });
    });
});