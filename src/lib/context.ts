export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
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
}

export type RequiredContext<T extends keyof Context> = Required<
  Pick<Context, T>
>

export type BaseContext = RequiredContext<'debug' | 'isExiting'>
