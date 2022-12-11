import { ListrBaseClassOptions, ListrContext, Manager } from 'listr2'

export function createTaskFactory<T = ListrContext>(
  override?: ListrBaseClassOptions,
): Manager<T> {
  return new Manager<T>({
    concurrent: false,
    registerSignalListeners: false,
    rendererOptions: {
      collapse: false,
      collapseSkips: false,
    },
    ...override,
  })
}
