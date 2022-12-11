export function deferred<T>() {
  let resolve!: (value: PromiseLike<T> | T) => void
  let reject!: (reason?: any) => void
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
