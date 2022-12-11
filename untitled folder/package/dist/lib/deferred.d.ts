export declare function deferred<T>(): {
    resolve: (value: PromiseLike<T> | T) => void;
    reject: (reason?: any) => void;
    promise: Promise<T>;
};
