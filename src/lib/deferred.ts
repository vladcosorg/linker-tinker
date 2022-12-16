export function deferred<T>(): {
  resolve: (value: PromiseLike<T> | T) => void
  reject: (reason?: unknown) => void
  promise: Promise<T>
} {
  let resolve!: (value: PromiseLike<T> | T) => void
  let reject!: ReturnType<typeof deferred>['reject']
  const promise = new Promise<T>((resolveInner, rejectInner) => {
    resolve = resolveInner
    reject = rejectInner
  })

  return {
    resolve,
    reject,
    promise,
  }
}
