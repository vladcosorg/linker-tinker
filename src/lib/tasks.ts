import { ListrBaseClassOptions, Manager, ListrRendererValue } from 'listr2'

export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
  syncPaths: string[] | string
}

export function createTaskFactory<
  O extends ListrBaseClassOptions<Context, ListrRendererValue>,
>(override: O): Manager<O['ctx'], NonNullable<O['renderer']>> {
  return new Manager({
    concurrent: false,
    registerSignalListeners: false,
    rendererOptions: {
      collapse: false,
      collapseSkips: false,
    },
    ...override,
  })
}
