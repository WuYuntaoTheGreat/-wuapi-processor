"use strict";
// vim: set ts=2 sw=2:
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ReqMethod = exports.WuApi = exports.Project = exports.createEntity = exports.createEnum = exports.enu = exports.obj = exports.unknown = exports.lst = exports.s2s = exports.str = exports.boo = exports.tim = exports.url = exports.idd = exports.dbl = exports.lng = exports.int = exports.itm = void 0;
__exportStar(require("./Interfaces"), exports);
var Definitions_1 = require("./Definitions");
Object.defineProperty(exports, "itm", { enumerable: true, get: function () { return Definitions_1.itm; } });
Object.defineProperty(exports, "int", { enumerable: true, get: function () { return Definitions_1.int; } });
Object.defineProperty(exports, "lng", { enumerable: true, get: function () { return Definitions_1.lng; } });
Object.defineProperty(exports, "dbl", { enumerable: true, get: function () { return Definitions_1.dbl; } });
Object.defineProperty(exports, "idd", { enumerable: true, get: function () { return Definitions_1.idd; } });
Object.defineProperty(exports, "url", { enumerable: true, get: function () { return Definitions_1.url; } });
Object.defineProperty(exports, "tim", { enumerable: true, get: function () { return Definitions_1.tim; } });
Object.defineProperty(exports, "boo", { enumerable: true, get: function () { return Definitions_1.boo; } });
Object.defineProperty(exports, "str", { enumerable: true, get: function () { return Definitions_1.str; } });
Object.defineProperty(exports, "s2s", { enumerable: true, get: function () { return Definitions_1.s2s; } });
Object.defineProperty(exports, "lst", { enumerable: true, get: function () { return Definitions_1.lst; } });
Object.defineProperty(exports, "unknown", { enumerable: true, get: function () { return Definitions_1.unknown; } });
Object.defineProperty(exports, "obj", { enumerable: true, get: function () { return Definitions_1.obj; } });
Object.defineProperty(exports, "enu", { enumerable: true, get: function () { return Definitions_1.enu; } });
Object.defineProperty(exports, "createEnum", { enumerable: true, get: function () { return Definitions_1.createEnum; } });
Object.defineProperty(exports, "createEntity", { enumerable: true, get: function () { return Definitions_1.createEntity; } });
Object.defineProperty(exports, "Project", { enumerable: true, get: function () { return Definitions_1.Project; } });
var Main_1 = require("./Main");
Object.defineProperty(exports, "WuApi", { enumerable: true, get: function () { return Main_1.WuApi; } });
var essential_1 = require("@wuapi/essential");
Object.defineProperty(exports, "$ReqMethod", { enumerable: true, get: function () { return essential_1.$ReqMethod; } });
