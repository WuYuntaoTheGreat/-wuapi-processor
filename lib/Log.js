"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.succeed = exports.info = exports.warning = exports.error = void 0;
function error(msg) {
    console.error('  [\x1b[31mERROR\x1b[m]: ', msg);
}
exports.error = error;
function warning(msg) {
    console.error('[\x1b[33mWARNING\x1b[m]: ', msg);
}
exports.warning = warning;
function info(msg) {
    console.error('   [\x1b[34mINFO\x1b[m]: ', msg);
}
exports.info = info;
function succeed(msg) {
    console.error('[\x1b[32mSUCCEED\x1b[m]: ', msg);
}
exports.succeed = succeed;
