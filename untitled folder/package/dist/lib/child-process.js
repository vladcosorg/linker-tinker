"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execNpm = void 0;
const tslib_1 = require("tslib");
const child_process = tslib_1.__importStar(require("node:child_process"));
const util = tslib_1.__importStar(require("node:util"));
const execAsync = util.promisify(child_process.exec);
async function execNpm(command, { options = [], cwd, }) {
    const compiledOptions = options
        .map((item) => Array.isArray(item) ? `--${item[0]} ${item[1]}` : `--${item}`)
        .join(' ');
    const compiledCommand = `npm ${compiledOptions}  ${command} `;
    // console.log(compiledCommand)
    const output = await execAsync(compiledCommand, { cwd });
    return output.stdout;
}
exports.execNpm = execNpm;
