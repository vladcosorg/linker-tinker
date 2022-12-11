import { z } from 'zod';
export declare function getPackageName(packageDirectory: string): Promise<string>;
export declare function copyFile(fromPath: string, toPath: string): Promise<void>;
export declare function removeFileOrDirectory(targetPath: string): Promise<void>;
export declare function getTargetPath(sourcePath: string, sourcePackageRoot: string, targetPackageRoot: string): Promise<string>;
declare function getValidationRules(packageRoot: string): z.ZodEffects<z.ZodArray<z.ZodEffects<z.ZodObject<{
    files: z.ZodArray<z.ZodEffects<z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>, string, {
        path: string;
    }>, "atleastone">;
}, "strip", z.ZodTypeAny, {
    files: [string, ...string[]];
}, {
    files: [{
        path: string;
    }, ...{
        path: string;
    }[]];
}>, [string, ...string[]], {
    files: [{
        path: string;
    }, ...{
        path: string;
    }[]];
}>, "atleastone">, [string, ...string[]], [{
    files: [{
        path: string;
    }, ...{
        path: string;
    }[]];
}, ...{
    files: [{
        path: string;
    }, ...{
        path: string;
    }[]];
}[]]>;
export declare function getPackList(sourcePackageRoot: string): Promise<z.infer<ReturnType<typeof getValidationRules>>>;
export declare function isPackageInstalled(packagePath: string, dependencyName: string): Promise<boolean>;
export declare function installPackage(packagePath: string, dependencyName: string): Promise<void>;
export declare function getWatchedFiles(sourcePackageRoot: string): Promise<string[] | string>;
export declare function formatPathToRelative(rootPath: string, relativePath: string): string;
export {};
