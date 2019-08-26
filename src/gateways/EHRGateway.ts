import {RequestOptions} from "./BaseGateway";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";

@injectable()
export class EHRLoginRequestOptionsFactory {
    readonly _optionsFactory: (body: any, headers: any, url: string) => RequestOptions;

    constructor(
        @inject(TYPES.RequestOptionFactory) factory: (category: string) => (body: any, headers: any, url: string) => RequestOptions // Injecting an engine factory
    ) {
        this._optionsFactory = factory("ehrLogin"); // Creating a diesel engine factory
    }

    public createOptions(body: any, headers: any, url: string): RequestOptions {
        return this._optionsFactory(body, headers, url); // Creating a concrete diesel engine
    }
}

@injectable()
export class FetchTemplateRequestOptionsFactory {
    private readonly _optionsFactory: (body: any, headers: any, url: string) => RequestOptions;

    constructor(
        @inject(TYPES.RequestOptionFactory) factory: (category: string) => (body: any, headers: any, url: string) => RequestOptions // Injecting an engine factory
    ) {
        this._optionsFactory = factory("fetchTemplate"); // Creating a diesel engine factory
    }

    public createOptions(body: any, headers: any, url: string): RequestOptions {
        return this._optionsFactory(body, headers, url); // Creating a concrete diesel engine
    }
}

@injectable()
export class StoreContributionRequestOptionsFactory {
    private readonly _optionsFactory: (body: any, headers: any, url: string) => RequestOptions;

    constructor(
        @inject(TYPES.RequestOptionFactory) factory: (category: string) => (body: any, headers: any, url: string) => RequestOptions // Injecting an engine factory
    ) {
        this._optionsFactory = factory("storeContribution"); // Creating a diesel engine factory
    }

    public createOptions(body: any, headers: any, url: string): RequestOptions {
        return this._optionsFactory(body, headers, url); // Creating a concrete diesel engine
    }
}

@injectable()
export class FetchTemplateRequestOptions implements RequestOptions {
    method = "GET";
    url = '';
    resolveWithFullResponse = true;
    json = true;
}

@injectable()
export class EHRLoginRequestOptions implements RequestOptions {
    method = "POST";
    url = '';
    resolveWithFullResponse = true;
    json = true;
}

@injectable()
export class StoreContributionRequestOptions implements RequestOptions {
    method = "POST";
    url = '';
    resolveWithFullResponse = true;
    body?: any;
    json = false;
}