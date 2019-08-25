const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const xpath = require('xpath');
const async = require("async");
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const dateFormat = "YYYYMMDDTHHmmss,SSSZZ";

const namespaces = {
    "versions": "http://schemas.openehr.org/v1",
    "xsi": "http://www.w3.org/2001/XMLSchema-instance"
};

const mergeContribution = (body, cb) => {

    let xml = body.contribution;
    let xmlDoc = new DOMParser().parseFromString(xml);

    let paths = body.answers.data;
    let meta = body.answers.meta;

    let select = xpath.useNamespaces(namespaces);

    let queryBase = "//versions:data/versions:content/versions:items";
    let hasItems = select(queryBase, xmlDoc);
    if (hasItems.length === 0) {
        queryBase = "//versions:data/versions:content";
    }

    async.eachLimit(paths, 1, (entry, callback) => {

        let path = entry.path;
        let type = entry.type;
        let value = entry.value;

        let selectArray = select(queryBase + formatPath(path), xmlDoc);
        let node;

        if (selectArray.length > 0) {
            if (selectArray.length > 1) {
                let i;
                for (i = 0; i < selectArray.length; i++) {
                    if (isEmpty(selectArray[i], type)) {
                        replaceValue(selectArray[i], type, value);
                        i = selectArray.length;
                    }
                }
                callback();
            } else {
                node = selectArray[0];
                replaceValue(node, type, value);
                callback();
            }
        } else {
            callback(`Path not found: ${path}`);
        }

    }, (err) => {
        if (err) {
                        cb(err);
        } else {
            setMetadata(xmlDoc, meta, select);
            let string = new XMLSerializer().serializeToString(xmlDoc);
            cb(null, string);
        }
    });
};

const setMetadata = (xmlDoc, meta, select) => {
    setContributionMeta(xmlDoc, meta, select);
    setOriginHistoryMeta(xmlDoc, select);
};

const setContributionMeta = (xmlDoc, meta, select) => {

    let contributionIdNode = select("//versions:contribution/versions:id/versions:value", xmlDoc);
    //console.log(contributionIdNode[0].firstChild.data);
    contributionIdNode[0].firstChild.data = uuidv4();

    let systemIdNode = select("//versions:commit_audit/versions:system_id", xmlDoc);
    //console.log(systemIdNode[0].firstChild.data);
    systemIdNode[0].firstChild.data = meta.system_id;

    let committerIdNode = select("//versions:commit_audit/versions:committer/versions:external_ref/versions:id/versions:value", xmlDoc);
    //console.log(committerIdNode[0].firstChild.data);
    committerIdNode[0].firstChild.data = uuidv4();

    let committerName = select("//versions:commit_audit/versions:committer/versions:name", xmlDoc);
    //console.log(committerName[0].firstChild.data);
    committerName[0].firstChild.data = meta.committer_name;

    let timeCommittedNode = select("//versions:commit_audit/versions:time_committed/versions:value", xmlDoc);
    //console.log(timeCommittedNode[0].firstChild.data);
    timeCommittedNode[0].firstChild.data = moment().format(dateFormat);

    let versionsIdNode = select("//versions:uid/versions:value", xmlDoc);
    //console.log(versionsIdNode[0].firstChild.data);
    versionsIdNode[0].firstChild.data = uuidv4() + '::EMR_APP::1';

    let composerIdNode = select("//versions:data/versions:composer/versions:external_ref/versions:id/versions:value", xmlDoc);
    //console.log(composerIdNode[0].firstChild.data);
    composerIdNode[0].firstChild.data = meta.composer_id;

    let composerNameNode = select("//versions:data/versions:composer/versions:name", xmlDoc);
    //console.log(composerNameNode[0].firstChild.data);
    composerNameNode[0].firstChild.data = meta.composer_name;

    let compositionDateNode = select("//versions:data/versions:context/versions:start_time/versions:value", xmlDoc);
    //console.log(compositionDateNode[0].firstChild.data);
    compositionDateNode[0].firstChild.data = moment().format(dateFormat);

    let compositionSettingNode = select("//versions:data/versions:context/versions:setting/versions:value", xmlDoc);
    //console.log(compositionSettingNode[0].firstChild.data);
    compositionSettingNode[0].firstChild.data = meta.composition_setting_value;

    let compositionSettingCodeNode = select("//versions:data/versions:context/versions:setting/versions:defining_code/versions:code_string", xmlDoc);
    //console.log(compositionSettingCodeNode[0].firstChild.data);
    compositionSettingCodeNode[0].firstChild.data = meta.composition_setting_code;

};

const setOriginHistoryMeta = (xmlDoc, select) => {
    let originNodes = select("//versions:origin", xmlDoc);
    //console.log(originNodes.length);
    let timeNodes = select("//versions:time", xmlDoc);
    //console.log(timeNodes.length);
    let dateNodes = originNodes.concat(timeNodes);
    dateNodes.forEach((node) => {
        //console.log(node.childNodes[1].firstChild.data);
        node.childNodes[1].firstChild.data = moment().format(dateFormat).toString();
    });
};

const isEmpty = (node, type) => {
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

const replaceValue = (node, type, value) => {
    switch (type) {
        case 'DV_TEXT':
            //console.log(`DV_TEXT ${node.childNodes[1].firstChild.data}`);
            node.childNodes[1].firstChild.data = value;
            break;
        case 'DV_COUNT':
            //console.log(`DV_COUNT ${node.childNodes[1].firstChild.data}`);
            node.childNodes[1].firstChild.data = value;
            break;
        case 'DV_DATE_TIME':
            //console.log(`DV_DATE_TIME ${node.childNodes[1].firstChild.data}`);
            node.childNodes[1].firstChild.data = value;
            break;
        case 'DV_QUANTITY':
            //console.log(`DV_QUANTITY ${node.firstChild.data}`);
            node.firstChild.data = value;
            break;
        case 'DV_CODED_TEXT':
            //console.log(`DV_CODED_TEXT ${node.childNodes[3].firstChild.data}`);
            //console.log(`DV_CODED_TEXT ${node.parentNode.childNodes[1].firstChild.data}`);
            node.childNodes[3].firstChild.data = value.code;
            node.parentNode.childNodes[1].firstChild.data = value.textValue;
            break;
        case 'DV_PROPORTION':
            //console.log(`DV_PROPORTION ${node.firstChild.data}`);
            node.firstChild.data = value;
            if (node.nodeName === "denominator") {
                //console.log(`DV_PROPORTION ${node.parentNode.childNodes[5].firstChild.data}`);
                //console.log(`DV_PROPORTION ${node.parentNode.childNodes[7].firstChild.data}`);
                if (node.parentNode.childNodes[5].firstChild.data.toString().includes("DV_PROPORTION_TYPE")) node.parentNode.childNodes[5].firstChild.data = "1";
                if (node.parentNode.childNodes[7].firstChild.data.toString().includes("DV_PROPORTION_PRECISION")) node.parentNode.childNodes[7].firstChild.data = "0";
            }
            break;
        case 'DV_MULTIMEDIA':
            //console.log(`DV_MULTIMEDIA ${node.childNodes[1].firstChild.data}`);
            //console.log(`DV_MULTIMEDIA ${node.childNodes[3].childNodes[3].firstChild.data}`);
            //console.log(`DV_MULTIMEDIA ${node.childNodes[5].firstChild.data}`);
            node.childNodes[1].firstChild.data = value.data;
            node.childNodes[3].childNodes[3].firstChild.data = value.type;
            node.childNodes[5].firstChild.data = value.size.toString();
            break;
    }
};

const formatPath = (path) => {
    let sections = path.slice(1).split("/");
    let bracketExpression = /\[(.*?)\]/;
    let query = "";

    sections.forEach((section) => {
        let base = "/versions:";
        let result;
        let attributedTarget = section.match(bracketExpression);
        if (attributedTarget) {
            result = `${base}${section.split("[")[0]}[@archetype_node_id = '${attributedTarget[1]}']`;
        } else {
            result = `${base}${section}`
        }
        query += result
    });

    return query;
};

module.exports = mergeContribution;