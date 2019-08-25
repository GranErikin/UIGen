"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var OPTService_1;
Object.defineProperty(exports, "__esModule", { value: true });
"use strict";
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const WorkerExceptions_1 = require("../workers/exceptions/WorkerExceptions");
const ContributionMerger_1 = require("./ContributionMerger");
let OPTService = OPTService_1 = class OPTService {
    constructor(fileSystem, domParser, xPath, exec, uuidGenerator, contributionMerger) {
        this.contributionMerger = contributionMerger;
        this.fileSystem = fileSystem;
        this.domParser = domParser;
        this.xPath = xPath;
        this.exec = exec;
        this.uuidGenerator = uuidGenerator;
    }
    writeTmpFile(content, uuid, type) {
        this.fileSystem.writeFileSync(`tmp/${uuid}.${type}`, content);
    }
    deleteTmpFile(uuid, type) {
        this.fileSystem.unlink(`tmp/${uuid}.${type}`, () => {
        });
    }
    getTemplateID(template) {
        const namespaces = {
            "template": "http://schemas.openehr.org/v1",
            "xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsd": "http://www.w3.org/2001/XMLSchema"
        };
        let xmlDoc = this.domParser.parseFromString(template);
        let select = this.xPath.useNamespaces(namespaces);
        let templateIdSelect = select("//template:template_id/template:value", xmlDoc, true);
        let templateIdNode = templateIdSelect;
        if (!templateIdNode.firstChild) {
            throw new WorkerExceptions_1.IDNotFoundOnTemplateException(template);
        }
        return templateIdNode.firstChild.textContent;
    }
    opt2html(template) {
        return new Promise((resolve, reject) => {
            try {
                let uuid = this.uuidGenerator.v4();
                this.writeTmpFile(template, uuid, "opt");
                this.exec(`java -cp \"./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar\" com.cabolabs.openehr.opt.Main uigen ${uuid}`);
                let htmlBuffer = this.fileSystem.readFileSync(`tmp/${uuid}.html`);
                this.deleteTmpFile(uuid, "html");
                this.deleteTmpFile(uuid, "opt");
                resolve(htmlBuffer.toString());
            }
            catch (error) {
                reject(error);
            }
        });
    }
    opt2Contribution(template) {
        return new Promise((resolve, reject) => {
            try {
                let uuid = this.uuidGenerator.v4();
                this.writeTmpFile(template, uuid, "opt");
                this.exec(`java -cp \"./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar\" com.cabolabs.openehr.opt.Main ingen ${uuid}  1 tagged`);
                let contributionBuffer = this.fileSystem.readFileSync(`tmp/${uuid}.instance`);
                this.deleteTmpFile(uuid, "contribution");
                this.deleteTmpFile(uuid, "opt");
                resolve(contributionBuffer.toString());
            }
            catch (error) {
                reject(error);
            }
        });
    }
    opt2bundle(template) {
        return __awaiter(this, void 0, void 0, function* () {
            return { html: yield this.opt2html(template), contribution: yield this.opt2Contribution(template) };
        });
    }
    mergeContribution(answers, contribution) {
        return new Promise((resolve, reject) => {
            try {
                this.contributionMerger.mergeContribution(answers, contribution, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    validateInstance(instance) {
        return new Promise((resolve, reject) => {
            try {
                let uuid = this.uuidGenerator.v4();
                this.writeTmpFile(instance, uuid, "instance");
                let validationBuffer = this.exec(`java -cp \"./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar\" com.cabolabs.openehr.opt.Main inval ${uuid}`);
                let isValid = OPTService_1.checkValidationBuffer(validationBuffer.toString());
                this.deleteTmpFile(uuid, "instance");
                resolve(isValid);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static checkValidationBuffer(validation) {
        let results = validation.split('\n');
        results.pop();
        let element = results.shift();
        if (!element) {
            throw new WorkerExceptions_1.ValidationServiceFailedException();
        }
        return !element.includes('NOT VALID');
    }
};
OPTService = OPTService_1 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.FS)),
    __param(1, inversify_1.inject(types_1.TYPES.DOMParser)),
    __param(2, inversify_1.inject(types_1.TYPES.Xpath)),
    __param(3, inversify_1.inject(types_1.TYPES.EXEC)),
    __param(4, inversify_1.inject(types_1.TYPES.UUID)),
    __param(5, inversify_1.inject(types_1.TYPES.ContributionMerger)),
    __metadata("design:paramtypes", [Object, Object, Object, Function, Object, ContributionMerger_1.ContributionMerger])
], OPTService);
exports.OPTService = OPTService;
//# sourceMappingURL=OPTService.js.map