import {RequestOptions} from "./BaseGateway";

const ehrServerHost = process.env.EHR_SERVER_HOST;
const ehrAuthenticateUrl = `${ehrServerHost}/login?username=${process.env.EHR_SERVER_USERNAME}&password=${process.env.EHR_SERVER_PASSWORD}&organization=${process.env.EHR_SERVER_ORGANIZATION}&format=json`;
const fetchOPTTemplateUrl = `${ehrServerHost}/templates/`;
const storeContributionUrl = `${ehrServerHost}/ehrs/{ehrUID}/compositions?auditCommitter={committer}`;

export class FetchTemplateRequestOptions implements RequestOptions {
    body = {};
    headers: any;
    method = "GET";
    url: string;

    constructor(token: string, templateId: string) {
        this.url = `${fetchOPTTemplateUrl}${templateId}`;
        this.headers = {
            'Accept': 'application/json, text/xml',
            'Authorization': `Bearer ${token}`
        }
    }
}

export class EHRAuthenticateRequestOptions implements RequestOptions {
    body = {};
    headers = {'Content-Type': 'application/json'};
    method = "POST";
    url = ehrAuthenticateUrl;
}

export class StoreContributionRequestOptions implements RequestOptions {
    body: string;
    headers: any;
    method = "POST";
    url = ehrAuthenticateUrl;

    constructor(token: string, committer: string, ehrId: string, contribution: string) {
        this.url = storeContributionUrl.replace('{ehrUID}', ehrId).replace('{committer}', committer);
        this.headers = {
            'Accept': 'application/json, text/xml',
            'Content-Type': 'application/xml',
            'Authorization': `Bearer ${token}`
        };
        this.body = contribution;
    }
}