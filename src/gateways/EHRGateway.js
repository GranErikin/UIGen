"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ehrServerHost = process.env.EHR_SERVER_HOST;
const ehrAuthenticateUrl = `${ehrServerHost}/login?username=${process.env.EHR_SERVER_USERNAME}&password=${process.env.EHR_SERVER_PASSWORD}&organization=${process.env.EHR_SERVER_ORGANIZATION}&format=json`;
const fetchOPTTemplateUrl = `${ehrServerHost}/templates/`;
const storeContributionUrl = `${ehrServerHost}/ehrs/{ehrUID}/compositions?auditCommitter={committer}`;
class FetchTemplateRequestOptions {
    constructor(token, templateId) {
        this.body = {};
        this.method = "GET";
        this.url = `${fetchOPTTemplateUrl}${templateId}`;
        this.headers = {
            'Accept': 'application/json, text/xml',
            'Authorization': `Bearer ${token}`
        };
    }
}
exports.FetchTemplateRequestOptions = FetchTemplateRequestOptions;
class EHRAuthenticateRequestOptions {
    constructor() {
        this.body = {};
        this.headers = { 'Content-Type': 'application/json' };
        this.method = "POST";
        this.url = ehrAuthenticateUrl;
    }
}
exports.EHRAuthenticateRequestOptions = EHRAuthenticateRequestOptions;
class StoreContributionRequestOptions {
    constructor(token, committer, ehrId, contribution) {
        this.method = "POST";
        this.url = ehrAuthenticateUrl;
        this.url = storeContributionUrl.replace('{ehrUID}', ehrId).replace('{committer}', committer);
        this.headers = {
            'Accept': 'application/json, text/xml',
            'Content-Type': 'application/xml',
            'Authorization': `Bearer ${token}`
        };
        this.body = contribution;
    }
}
exports.StoreContributionRequestOptions = StoreContributionRequestOptions;
//# sourceMappingURL=EHRGateway.js.map