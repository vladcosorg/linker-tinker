import {
  ListrBaseClassOptions,
  ListrContext,
  ListrDefaultRendererValue,
  ListrSimpleRendererValue,
  Manager,
} from 'listr2'

export function createTaskFactory<T = ListrContext>(
  override?: ListrBaseClassOptions<T> & {
    renderer: ListrDefaultRendererValue | ListrSimpleRendererValue
  },
): Manager<T> {
  return new Manager<T>({
    concurrent: false,
    // renderer: 'simple',
    registerSignalListeners: false,
    rendererOptions: {
      collapse: false,
      collapseSkips: false,
    },
    ...override,
  })
}
