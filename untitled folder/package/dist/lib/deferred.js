"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deferred = void 0;
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolveInner, rejectInner) => {
        resolve = resolveInner;
        reject = rejectInner;
    });
    return {
        resolve,
        reject,
        promise,
    };
}
exports.deferred = deferred;
