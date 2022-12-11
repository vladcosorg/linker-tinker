"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPathToRelative = exports.getWatchedFiles = exports.installPackage = exports.isPackageInstalled = exports.getPackList = exports.getTargetPath = exports.removeFileOrDirectory = exports.copyFile = exports.getPackageName = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const fs_extra_1 = require("fs-extra");
const zod_1 = require("zod");
const child_process_1 = require("../lib/child-process");
async function readPackageJson(packageDirectory) {
    return (0, fs_extra_1.readJson)(node_path_1.default.join(packageDirectory, 'package.json'));
}
async function getPackageName(packageDirectory) {
    const packageJson = await readPackageJson(packageDirectory);
    if (!packageJson.name) {
        throw new Error(`Could not find a package name in the package.json in the directory '${packageDirectory}'`);
    }
    return packageJson.name;
}
exports.getPackageName = getPackageName;
async function copyFile(fromPath, toPath) {
    await (0, fs_extra_1.copy)(fromPath, toPath);
}
exports.copyFile = copyFile;
async function removeFileOrDirectory(targetPath) {
    await (0, fs_extra_1.remove)(targetPath);
}
exports.removeFileOrDirectory = removeFileOrDirectory;
async function getTargetPath(sourcePath, sourcePackageRoot, targetPackageRoot) {
    return node_path_1.default.join(targetPackageRoot, 'node_modules', await getPackageName(sourcePackageRoot), sourcePath.slice(sourcePackageRoot.length + 1));
}
exports.getTargetPath = getTargetPath;
function getValidationRules(packageRoot) {
    return zod_1.z
        .array(zod_1.z
        .object({
        files: zod_1.z
            .array(zod_1.z
            .object({ path: zod_1.z.string() })
            .transform((value) => node_path_1.default.join(packageRoot, value.path)))
            .nonempty(),
    })
        .transform((value) => value.files))
        .nonempty()
        .length(1)
        .transform((value) => value[0]);
}
async function getPackList(sourcePackageRoot) {
    const output = await (0, child_process_1.execNpm)('pack', {
        options: ['dry-run', 'json'],
        cwd: sourcePackageRoot,
    });
    // console.log(output)
    return getValidationRules(sourcePackageRoot).parse(JSON.parse(output.toString()));
}
exports.getPackList = getPackList;
async function isPackageInstalled(packagePath, dependencyName) {
    var _a, _b, _c;
    const packageJson = await readPackageJson(packagePath);
    return Boolean((_b = (_a = packageJson.devDependencies) === null || _a === void 0 ? void 0 : _a[dependencyName]) !== null && _b !== void 0 ? _b : (_c = packageJson.dependencies) === null || _c === void 0 ? void 0 : _c[dependencyName]);
}
exports.isPackageInstalled = isPackageInstalled;
async function installPackage(packagePath, dependencyName) {
    await (0, child_process_1.execNpm)(`install  '${dependencyName}'`, {
        options: ['save-dev'],
        cwd: packagePath,
    });
}
exports.installPackage = installPackage;
async function getWatchedFiles(sourcePackageRoot) {
    try {
        return await getPackList(sourcePackageRoot);
    }
    catch {
        // console.log(getErrorMessage(error))
        return sourcePackageRoot;
    }
}
exports.getWatchedFiles = getWatchedFiles;
function formatPathToRelative(rootPath, relativePath) {
    return `./${node_path_1.default.relative(node_path_1.default.join(rootPath, '..'), relativePath)}`;
}
exports.formatPathToRelative = formatPathToRelative;
