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
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const types_1 = require("../di/types");
const WorkerExceptions_1 = require("../workers/exceptions/WorkerExceptions");
let ContributionMerger = class ContributionMerger {
    constructor(domParser, xmlSerializer, moment, xpath, async, uuidGenerator) {
        this.namespaces = {
            "versions": "http://schemas.openehr.org/v1",
            "xsi": "http://www.w3.org/2001/XMLSchema-instance"
        };
        this.dateFormat = "YYYYMMDDTHHmmss,SSSZZ";
        this.mergeContribution = (answers, contribution, cb) => {
            let xmlDoc = this.domParser.parseFromString(contribution);
            let paths = answers.data;
            let meta = answers.meta;
            let select = this.xpath.useNamespaces(this.namespaces);
            let queryBase = "//versions:data/versions:content/versions:items";
            let hasItems = select(queryBase, xmlDoc);
            if (hasItems.length === 0) {
                queryBase = "//versions:data/versions:content";
            }
            this.async.eachLimit(paths, 1, (entry, callback) => {
                let path = entry.path;
                let type = entry.type;
                let value = entry.value;
                let selectArray = select(queryBase + this.formatPath(path), xmlDoc);
                let node;
                if (selectArray.length > 0) {
                    if (selectArray.length > 1) {
                        let i;
                        for (i = 0; i < selectArray.length; i++) {
                            if (this.isEmpty(selectArray[i], type)) {
                                this.replaceValue(selectArray[i], type, value);
                                i = selectArray.length;
                            }
                        }
                        callback(undefined);
                    }
                    else {
                        node = selectArray[0];
                        this.replaceValue(node, type, value);
                        callback(undefined);
                    }
                }
                else {
                    callback(`Path not found: ${path}`);
                }
            }, (err) => {
                if (err) {
                    cb(err);
                }
                else {
                    this.setMetadata(xmlDoc, meta, select);
                    let string = this.xmlSerializer.serializeToString(xmlDoc);
                    cb(undefined, string);
                }
            });
        };
        this.setMetadata = (xmlDoc, meta, select) => {
            this.setContributionMeta(xmlDoc, meta, select);
            this.setOriginHistoryMeta(xmlDoc, select);
        };
        this.setContributionMeta = (xmlDoc, meta, select) => {
            let contributionIdNode = select("//versions:contribution/versions:id/versions:value", xmlDoc, true);
            //console.log(contributionIdNode[0].firstChild.data);
            if (!contributionIdNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:contribution/versions:id/versions:value", xmlDoc.toString());
            }
            contributionIdNode.firstChild.textContent = this.uuidGenerator.v4();
            let systemIdNode = select("//versions:commit_audit/versions:system_id", xmlDoc, true);
            //console.log(systemIdNode[0].firstChild.data);
            if (!systemIdNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:commit_audit/versions:system_id", xmlDoc.toString());
            }
            systemIdNode.firstChild.textContent = meta.system_id;
            let committerIdNode = select("//versions:commit_audit/versions:committer/versions:external_ref/versions:id/versions:value", xmlDoc, true);
            //console.log(committerIdNode[0].firstChild.data);
            if (!committerIdNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:commit_audit/versions:committer/versions:external_ref/versions:id/versions:value", xmlDoc.toString());
            }
            committerIdNode.firstChild.textContent = this.uuidGenerator.v4();
            let committerName = select("//versions:commit_audit/versions:committer/versions:name", xmlDoc, true);
            //console.log(committerName[0].firstChild.data);
            if (!committerName.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:commit_audit/versions:committer/versions:name", xmlDoc.toString());
            }
            committerName.firstChild.textContent = meta.committer_name;
            let timeCommittedNode = select("//versions:commit_audit/versions:time_committed/versions:value", xmlDoc, true);
            //console.log(timeCommittedNode[0].firstChild.data);
            if (!timeCommittedNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:commit_audit/versions:time_committed/versions:value", xmlDoc.toString());
            }
            timeCommittedNode.firstChild.textContent = this.moment().format(this.dateFormat);
            let versionsIdNode = select("//versions:uid/versions:value", xmlDoc, true);
            //console.log(versionsIdNode[0].firstChild.data);
            if (!versionsIdNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:uid/versions:value", xmlDoc.toString());
            }
            versionsIdNode.firstChild.textContent = this.uuidGenerator.v4() + '::EMR_APP::1';
            let composerIdNode = select("//versions:data/versions:composer/versions:external_ref/versions:id/versions:value", xmlDoc, true);
            //console.log(composerIdNode[0].firstChild.data);
            if (!composerIdNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:data/versions:composer/versions:external_ref/versions:id/versions:value", xmlDoc.toString());
            }
            composerIdNode.firstChild.textContent = meta.composer_id;
            let composerNameNode = select("//versions:data/versions:composer/versions:name", xmlDoc, true);
            //console.log(composerNameNode[0].firstChild.data);
            if (!composerNameNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:data/versions:composer/versions:name", xmlDoc.toString());
            }
            composerNameNode.firstChild.textContent = meta.composer_name;
            let compositionDateNode = select("//versions:data/versions:context/versions:start_time/versions:value", xmlDoc, true);
            //console.log(compositionDateNode[0].firstChild.data);
            if (!compositionDateNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:data/versions:context/versions:start_time/versions:value", xmlDoc.toString());
            }
            compositionDateNode.firstChild.textContent = this.moment().format(this.dateFormat);
            let compositionSettingNode = select("//versions:data/versions:context/versions:setting/versions:value", xmlDoc, true);
            //console.log(compositionSettingNode[0].firstChild.data);
            if (!compositionSettingNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:data/versions:context/versions:setting/versions:value", xmlDoc.toString());
            }
            compositionSettingNode.firstChild.textContent = meta.composition_setting_value;
            let compositionSettingCodeNode = select("//versions:data/versions:context/versions:setting/versions:defining_code/versions:code_string", xmlDoc, true);
            //console.log(compositionSettingCodeNode[0].firstChild.data);
            if (!compositionSettingCodeNode.firstChild) {
                throw new WorkerExceptions_1.MetaFieldMissingException("//versions:data/versions:context/versions:setting/versions:defining_code/versions:code_string", xmlDoc.toString());
            }
            compositionSettingCodeNode.firstChild.textContent = meta.composition_setting_code;
        };
        this.setOriginHistoryMeta = (xmlDoc, select) => {
            let originNodes = select("//versions:origin", xmlDoc);
            //console.log(originNodes.length);
            let timeNodes = select("//versions:time", xmlDoc);
            //console.log(timeNodes.length);
            let dateNodes = originNodes.concat(timeNodes);
            dateNodes.forEach((node) => {
                //console.log(node.childNodes[1].firstChild.data);
                node.childNodes[1].firstChild.textContent = this.moment().format(this.dateFormat).toString();
            });
        };
        this.isEmpty = (node, type) => {
            switch (type) {
                case 'DV_TEXT':
                    //console.log(`DV_TEXT ${node.childNodes[1].firstChild.data}`);
                    return node.childNodes[1].firstChild.data.toString().includes("DV_TEXT");
                case 'DV_COUNT':
                    //console.log(`DV_COUNT ${node.childNodes[1].firstChild.data}`);
                    return node.childNodes[1].firstChild.data.toString().includes("DV_COUNT");
                case 'DV_DATE_TIME':
                    //console.log(`DV_DATE_TIME ${node.childNodes[1].firstChild.data}`);
                    return node.childNodes[1].firstChild.data.toString().includes("DV_DATE_TIME");
                case 'DV_QUANTITY':
                    //console.log(`DV_QUANTITY ${node.firstChild.data}`);
                    return node.firstChild.data.toString().includes("DV_QUANTITY");
                case 'DV_CODED_TEXT':
                    //console.log(`DV_CODED_TEXT ${node.childNodes[3].firstChild.data}`);
                    //console.log(`DV_CODED_TEXT ${node.parentNode.childNodes[1].firstChild.data}`);
                    return (node.childNodes[3].firstChild.data.toString().includes("CODEDTEXT_CODE") ||
                        node.parentNode.childNodes[1].firstChild.data.toString().includes("CODEDTEXT_VALUE"));
                case 'DV_PROPORTION':
                    //console.log(`DV_PROPORTION ${node.firstChild.data}`);
                    return node.firstChild.data.toString().includes("DV_PROPORTION");
                case 'DV_MULTIMEDIA':
                    //console.log(`DV_MULTIMEDIA ${node.childNodes[1].firstChild.data}`);
                    //console.log(`DV_MULTIMEDIA ${node.childNodes[3].childNodes[3].firstChild.data}`);
                    //console.log(`DV_MULTIMEDIA ${node.childNodes[5].firstChild.data}`);
                    return node.childNodes[1].firstChild.data.toString().includes("DV_MULTIMEDIA_DATA") ||
                        node.childNodes[3].childNodes[3].firstChild.data.toString().includes("DV_MULTIMEDIA_MEDIATYPE") ||
                        node.childNodes[5].firstChild.data.toString().includes("DV_MULTIMEDIA_SIZE");
            }
        };
        this.replaceValue = (node, type, value) => {
            switch (type) {
                case 'DV_TEXT':
                    //console.log(`DV_TEXT ${node.childNodes[1].firstChild.data}`);
                    node.childNodes[1].firstChild.textContent = value;
                    break;
                case 'DV_COUNT':
                    //console.log(`DV_COUNT ${node.childNodes[1].firstChild.data}`);
                    node.childNodes[1].firstChild.textContent = value;
                    break;
                case 'DV_DATE_TIME':
                    //console.log(`DV_DATE_TIME ${node.childNodes[1].firstChild.data}`);
                    node.childNodes[1].firstChild.textContent = value;
                    break;
                case 'DV_QUANTITY':
                    //console.log(`DV_QUANTITY ${node.firstChild.data}`);
                    node.firstChild.textContent = value;
                    break;
                case 'DV_CODED_TEXT':
                    //console.log(`DV_CODED_TEXT ${node.childNodes[3].firstChild.data}`);
                    //console.log(`DV_CODED_TEXT ${node.parentNode.childNodes[1].firstChild.data}`);
                    node.childNodes[3].firstChild.textContent = value.code;
                    node.parentNode.childNodes[1].firstChild.textContent = value.textValue;
                    break;
                case 'DV_PROPORTION':
                    //console.log(`DV_PROPORTION ${node.firstChild.data}`);
                    node.firstChild.textContent = value;
                    if (node.nodeName === "denominator") {
                        //console.log(`DV_PROPORTION ${node.parentNode.childNodes[5].firstChild.data}`);
                        //console.log(`DV_PROPORTION ${node.parentNode.childNodes[7].firstChild.data}`);
                        if (node.parentNode.childNodes[5].firstChild.textContent.toString().includes("DV_PROPORTION_TYPE"))
                            node.parentNode.childNodes[5].firstChild.textContent = "1";
                        if (node.parentNode.childNodes[7].firstChild.textContent.toString().includes("DV_PROPORTION_PRECISION"))
                            node.parentNode.childNodes[7].firstChild.textContent = "0";
                    }
                    break;
                case 'DV_MULTIMEDIA':
                    //console.log(`DV_MULTIMEDIA ${node.childNodes[1].firstChild.data}`);
                    //console.log(`DV_MULTIMEDIA ${node.childNodes[3].childNodes[3].firstChild.data}`);
                    //console.log(`DV_MULTIMEDIA ${node.childNodes[5].firstChild.data}`);
                    node.childNodes[1].firstChild.textContent = value.data;
                    node.childNodes[3].childNodes[3].firstChild.textContent = value.type;
                    node.childNodes[5].firstChild.textContent = value.size.toString();
                    break;
            }
        };
        this.formatPath = (path) => {
            let sections = path.slice(1).split("/");
            let bracketExpression = /\[(.*?)]/;
            let query = "";
            sections.forEach((section) => {
                let base = "/versions:";
                let result;
                let attributedTarget = section.match(bracketExpression);
                if (attributedTarget) {
                    result = `${base}${section.split("[")[0]}[@archetype_node_id = '${attributedTarget[1]}']`;
                }
                else {
                    result = `${base}${section}`;
                }
                query += result;
            });
            return query;
        };
        this.domParser = domParser;
        this.xmlSerializer = xmlSerializer;
        this.moment = moment;
        this.xpath = xpath;
        this.async = async;
        this.uuidGenerator = uuidGenerator;
    }
};
ContributionMerger = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.DOMParser)),
    __param(1, inversify_1.inject(types_1.TYPES.XMLSerializer)),
    __param(2, inversify_1.inject(types_1.TYPES.Moment)),
    __param(3, inversify_1.inject(types_1.TYPES.Xpath)),
    __param(4, inversify_1.inject(types_1.TYPES.Async)),
    __param(5, inversify_1.inject(types_1.TYPES.UUID)),
    __metadata("design:paramtypes", [Object, Object, Function, Object, Object, Object])
], ContributionMerger);
exports.ContributionMerger = ContributionMerger;
//# sourceMappingURL=ContributionMerger.js.map