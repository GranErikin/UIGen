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
let EHRLoginRequestOptionsFactory = class EHRLoginRequestOptionsFactory {
    constructor(factory // Injecting an engine factory
    ) {
        this._optionsFactory = factory("ehrLogin"); // Creating a diesel engine factory
    }
    createOptions(body, headers, url) {
        return this._optionsFactory(body, headers, url); // Creating a concrete diesel engine
    }
};
EHRLoginRequestOptionsFactory = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.RequestOptionFactory)),
    __metadata("design:paramtypes", [Function])
], EHRLoginRequestOptionsFactory);
exports.EHRLoginRequestOptionsFactory = EHRLoginRequestOptionsFactory;
let FetchTemplateRequestOptionsFactory = class FetchTemplateRequestOptionsFactory {
    constructor(factory // Injecting an engine factory
    ) {
        this._optionsFactory = factory("fetchTemplate"); // Creating a diesel engine factory
    }
    createOptions(body, headers, url) {
        return this._optionsFactory(body, headers, url); // Creating a concrete diesel engine
    }
};
FetchTemplateRequestOptionsFactory = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.RequestOptionFactory)),
    __metadata("design:paramtypes", [Function])
], FetchTemplateRequestOptionsFactory);
exports.FetchTemplateRequestOptionsFactory = FetchTemplateRequestOptionsFactory;
let StoreContributionRequestOptionsFactory = class StoreContributionRequestOptionsFactory {
    constructor(factory // Injecting an engine factory
    ) {
        this._optionsFactory = factory("storeContribution"); // Creating a diesel engine factory
    }
    createOptions(body, headers, url) {
        return this._optionsFactory(body, headers, url); // Creating a concrete diesel engine
    }
};
StoreContributionRequestOptionsFactory = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.RequestOptionFactory)),
    __metadata("design:paramtypes", [Function])
], StoreContributionRequestOptionsFactory);
exports.StoreContributionRequestOptionsFactory = StoreContributionRequestOptionsFactory;
let FetchTemplateRequestOptions = class FetchTemplateRequestOptions {
    constructor() {
        this.method = "GET";
        this.url = '';
        this.resolveWithFullResponse = true;
        this.json = true;
    }
};
FetchTemplateRequestOptions = __decorate([
    inversify_1.injectable()
], FetchTemplateRequestOptions);
exports.FetchTemplateRequestOptions = FetchTemplateRequestOptions;
let EHRLoginRequestOptions = class EHRLoginRequestOptions {
    constructor() {
        this.method = "POST";
        this.url = '';
        this.resolveWithFullResponse = true;
        this.json = true;
    }
};
EHRLoginRequestOptions = __decorate([
    inversify_1.injectable()
], EHRLoginRequestOptions);
exports.EHRLoginRequestOptions = EHRLoginRequestOptions;
let StoreContributionRequestOptions = class StoreContributionRequestOptions {
    constructor() {
        this.method = "POST";
        this.url = '';
        this.resolveWithFullResponse = true;
        this.json = false;
    }
};
StoreContributionRequestOptions = __decorate([
    inversify_1.injectable()
], StoreContributionRequestOptions);
exports.StoreContributionRequestOptions = StoreContributionRequestOptions;
//# sourceMappingURL=EHRGateway.js.map