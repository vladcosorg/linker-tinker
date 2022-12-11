import { Command } from '@oclif/core';
export default class Sync extends Command {
    static description: string;
    static args: {
        name: string;
        description: string;
        required: true;
    }[];
    private tasks;
    run(): Promise<void>;
    private startWatcher;
    private checkIfThePathExists;
    private checkIfIsValidNodePackage;
    private checkIfSourcePackageInstalled;
    private installTheDependentPackage;
    private getPackList;
    private getFallbackPackList;
}
