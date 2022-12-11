export declare function execNpm(command: string, { options, cwd, }: {
    options?: Array<string | [string, string]>;
    cwd?: string;
}): Promise<string>;
