"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const core_1 = require("@oclif/core");
const chokidar_1 = require("chokidar");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const node_notifier_1 = tslib_1.__importDefault(require("node-notifier"));
const deferred_1 = require("../lib/deferred");
const misc_1 = require("../lib/misc");
const tasks_1 = require("../lib/tasks");
class Sync extends core_1.Command {
    constructor() {
        super(...arguments);
        this.tasks = (0, tasks_1.createTaskFactory)();
    }
    async run() {
        const { args } = (await this.parse(Sync));
        this.tasks.ctx = {
            sourcePackagePath: node_path_1.default.resolve(args.from),
            targetPackagePath: node_path_1.default.resolve(args.to),
            syncPaths: node_path_1.default.resolve(args.from),
        };
        this.tasks.add([
            {
                title: 'Source package verification',
                task: (context, task) => task.newListr([
                    this.checkIfThePathExists(context.sourcePackagePath),
                    this.checkIfIsValidNodePackage(context.sourcePackagePath),
                ], { concurrent: false }),
            },
            {
                title: 'Target package verification',
                task: (context, task) => task.newListr([
                    this.checkIfThePathExists(context.targetPackagePath),
                    this.checkIfIsValidNodePackage(context.targetPackagePath),
                ], { concurrent: false }),
            },
            {
                enabled: false,
                title: 'Dependent package installation in the the host package',
                task: (context, task) => task.newListr([
                    this.checkIfSourcePackageInstalled(),
                    this.installTheDependentPackage(),
                ], {
                    concurrent: false,
                }),
            },
            {
                title: 'Finding the files for sync',
                task: (context, task) => task.newListr([this.getPackList(), this.getFallbackPackList()], {
                    concurrent: false,
                    exitOnError: false,
                    rendererOptions: { collapseErrors: false },
                }),
            },
            this.startWatcher(),
        ]);
        await this.tasks.runAll();
    }
    startWatcher() {
        function createIntermediateTask(list) {
            const { resolve, reject, promise } = (0, deferred_1.deferred)();
            list.add([
                {
                    title: 'Waiting for changes',
                    task: async (context, task) => {
                        const result = await promise;
                        task.title = result;
                    },
                    options: {
                        exitOnError: false,
                    },
                },
            ]);
            return { resolve, reject };
        }
        return {
            title: 'Starting watching the files',
            task: (context, task) => {
                const newList = task.newListr([], { exitOnError: false });
                let { resolve, reject } = createIntermediateTask(newList);
                (0, chokidar_1.watch)(context.syncPaths, {
                    ignoreInitial: true,
                    persistent: true,
                }).on('all', (eventName, sourcePath, stats) => {
                    void (0, misc_1.getTargetPath)(sourcePath, context.sourcePackagePath, context.targetPackagePath)
                        .then(async (targetPath) => {
                        switch (eventName) {
                            case 'add':
                            case 'change': {
                                await (0, misc_1.copyFile)(sourcePath, targetPath);
                                if (node_path_1.default.join(context.sourcePackagePath, 'package.json') ===
                                    targetPath) {
                                    newList.add(this.installTheDependentPackage('Detected changes in source package.json. Reinstalling the package to pick up possible (peer)dependency changes.'));
                                }
                                resolve(`Copied from ${(0, misc_1.formatPathToRelative)(context.sourcePackagePath, sourcePath)} to ${(0, misc_1.formatPathToRelative)(context.targetPackagePath, targetPath)}`);
                                ({ resolve, reject } = createIntermediateTask(newList));
                                break;
                            }
                            case 'unlink':
                            case 'unlinkDir': {
                                await (0, misc_1.removeFileOrDirectory)(targetPath);
                                resolve(`Removed ${targetPath}`);
                                ({ resolve, reject } = createIntermediateTask(newList));
                                break;
                            }
                            default: {
                                throw new Error(`Unknown event ${eventName}`);
                            }
                        }
                    })
                        .catch((error) => {
                        node_notifier_1.default.notify({
                            title: 'linkandtink',
                            message: `An error occured. Please check console for more info.`,
                        });
                        reject(error);
                        ({ resolve, reject } = createIntermediateTask(newList));
                    });
                });
                return newList;
            },
        };
    }
    checkIfThePathExists(userPath) {
        return {
            title: 'Checking if the path exists and is a directory',
            task: async () => {
                const stat = await fs_extra_1.default.lstat(userPath);
                if (!stat.isDirectory()) {
                    throw new Error('The provided path is not a directory');
                }
            },
        };
    }
    checkIfIsValidNodePackage(packagePath) {
        return {
            title: 'Checking if the path is a valid node package',
            task: async (context, task) => {
                const name = await (0, misc_1.getPackageName)(packagePath);
                task.output = `Found package ${name}`;
            },
            options: { persistentOutput: true },
        };
    }
    checkIfSourcePackageInstalled() {
        return {
            title: 'Checking if the source package is already installed',
            task: async (context, task) => {
                await (0, misc_1.isPackageInstalled)(context.targetPackagePath, await (0, misc_1.getPackageName)(context.sourcePackagePath));
            },
        };
    }
    installTheDependentPackage(title = 'Installing the package') {
        return {
            title,
            task: async (context, task) => {
                await (0, misc_1.installPackage)(context.targetPackagePath, context.sourcePackagePath);
            },
        };
    }
    getPackList() {
        return {
            title: "Extracting the files from the 'npm pack' command",
            task: async (context, task) => {
                context.syncPaths = await (0, misc_1.getPackList)(context.sourcePackagePath);
                // console.log(context.syncPaths)
                task.output = `Found ${context.syncPaths.length} files for sync`;
            },
            options: {
                exitOnError: false,
            },
        };
    }
    getFallbackPackList() {
        return {
            title: 'Could not get the listr. Falling back to syncing the whole directory.',
            task: (context, task) => {
                context.syncPaths = context.sourcePackagePath;
            },
            enabled: (context) => typeof context.syncPaths === 'string',
        };
    }
}
exports.default = Sync;
Sync.description = 'Start syncing the directory';
Sync.args = [
    { name: 'from', description: 'Source package', required: true },
    { name: 'to', description: 'Target package', required: true },
];
