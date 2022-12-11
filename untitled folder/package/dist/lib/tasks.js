"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskFactory = void 0;
const listr2_1 = require("listr2");
function createTaskFactory(override) {
    return new listr2_1.Manager({
        concurrent: false,
        registerSignalListeners: false,
        rendererOptions: {
            collapse: false,
            collapseSkips: false,
        },
        ...override,
    });
}
exports.createTaskFactory = createTaskFactory;
