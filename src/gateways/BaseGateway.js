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
let GatewayFactory = class GatewayFactory {
    constructor(requestLogger, requestEngine) {
        this.requestEngine = requestEngine;
        this.requestLogger = requestLogger;
    }
    build(options) {
        return new Gateway(this.requestLogger, this.requestEngine, options);
    }
};
GatewayFactory = __decorate([
    __param(0, inversify_1.inject(types_1.TYPES.Logger)), __param(0, inversify_1.tagged("name", "gateway")),
    __param(1, inversify_1.inject(types_1.TYPES.Request)),
    __metadata("design:paramtypes", [Object, Function])
], GatewayFactory);
exports.GatewayFactory = GatewayFactory;
let Gateway = class Gateway {
    constructor(gatewayLogger, requestEngine, options) {
        this.requestEngine = requestEngine;
        this.gatewayLogger = gatewayLogger;
        this.options = options;
    }
    request() {
        return new Promise((resolve, reject) => {
            this.doRequest().then((response) => {
                let requesterResponse = {
                    code: response.code,
                    message: response.message,
                    body: response.body
                };
                this.gatewayLogger.info(requesterResponse);
                resolve(requesterResponse);
            }).catch((error) => {
                this.gatewayLogger.error(error);
                reject(error);
            });
        });
    }
    doRequest() {
        return this.requestEngine(this.options);
    }
};
Gateway = __decorate([
    __param(0, inversify_1.inject(types_1.TYPES.Logger)), __param(0, inversify_1.tagged("name", "gatewayLogger")),
    __param(1, inversify_1.inject(types_1.TYPES.Request)),
    __metadata("design:paramtypes", [Object, Function, Object])
], Gateway);
exports.Gateway = Gateway;
//# sourceMappingURL=BaseGateway.js.map