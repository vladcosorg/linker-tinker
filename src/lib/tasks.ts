import type { Context, RequiredContext } from '@/lib/context'

import type {
  ListrDefaultRenderer,
  ListrRendererFactory,
  ListrTask,
  ListrTaskWrapper,
} from 'listr2'

export type ParentTask<LocalContext extends Partial<Context>> = Parameters<
  Extract<
    Parameters<
      ListrTaskWrapper<LocalContext, ListrDefaultRenderer>['newListr']
    >[0],
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function
  >
>[0]

export type ContextualTask<
  LocalContext extends Partial<Context> = Partial<Context>,
  Renderer extends ListrRendererFactory = ListrDefaultRenderer,
> = ListrTask<LocalContext, Renderer>

export type ContextualTaskWithRequired<
  ContextKeys extends keyof Context = any,
  Renderer extends ListrRendererFactory = ListrDefaultRenderer,
> = ContextualTask<RequiredContext<ContextKeys>, Renderer>

export type PickContext<T extends keyof Context> = Pick<Context, T>

export function createTask<Arguments extends any[]>(
  task: (...parameters: Arguments) => ListrTask,
) {
  return function (...parameters: Arguments): ListrTask {
    return new Proxy(task(...parameters), {
      get(...proxyParameters) {
        const [target, property] = proxyParameters
        if (property === 'task' && target.rollback !== undefined) {
          return function (
            context: Context,
            task: ListrTaskWrapper<Context, any>,
          ) {
            if (!context.rollbackQueue) {
              context.rollbackQueue = []
            }

            context.rollbackQueue.push({
              title: `Rollback: ${task.title}`,
              task: target.rollback!,
            })

            return target.task(context, task)
          }
        }

        return Reflect.get(...proxyParameters)
      },
    })
  }
}
