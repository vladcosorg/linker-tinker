import type { ListrTask } from 'listr2'

export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
  intermediateCacheDirectory: string
  syncPaths: string[] | string
  runWatcherScript: string | undefined
  debug: boolean
  bidirectionalSync: boolean
  isExiting: boolean
  skipWatch: boolean
  noSymlink: boolean
  watchAll: boolean
  pendingBidirectionalUpdates: { fromSource: string[]; toSource: string[] }
  dependentPackageName: string
  onlyAttach: boolean
  foregroundWatcher: boolean
  rollbackQueue: ListrTask[]
}

export type RequiredContext<T extends keyof Context> = Required<
  Pick<Context, T>
>

export type BaseContext = RequiredContext<'debug' | 'isExiting'>

export function createSubcontext<C extends Context, T extends Array<keyof C>>(
  contextKeys: T,
  context: C,
): Required<Pick<C, T[number]>> {
  return new Proxy(context, {
    get(target, name: string, receiver) {
      if (!contextKeys.includes(name) || !Reflect.has(target, name)) {
        throw new Error(`Getting non-existent property '${name}'`)
      }

      return Reflect.get(target, name, receiver)
    },
    set(target, name, value, receiver) {
      if (!Reflect.has(target, name)) {
        throw new Error(
          `Setting non-existent property '${name}', initial value: ${value}`,
        )
      }

      return Reflect.set(target, name, value, receiver)
    },
  }) as unknown as Required<Pick<C, T[number]>>
}
