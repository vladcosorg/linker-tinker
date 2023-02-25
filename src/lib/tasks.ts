import type { Context, RequiredContext } from '@/lib/context'
import { createSubcontext } from '@/lib/context'

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

export function createTaskk<
  ContextKeys extends Array<keyof Context>,
  Task extends (
    subcontext: RequiredContext<ContextKeys[number]>,
  ) => ContextualTask<RequiredContext<ContextKeys[number]>>,
>(
  task: Task,
  contextKeys: ContextKeys,
): {
  create: <T extends Pick<Context, ContextKeys[number]>>(
    context: T,
  ) => ContextualTask<RequiredContext<ContextKeys[number]>>
  context: ContextKeys
} {
  return {
    create: (fullContext) => task(createSubcontext(contextKeys, fullContext)),
    context: contextKeys,
  }
}

export type PickContext<T extends keyof Context> = Pick<Context, T>

export function createTask<
  T extends keyof Context,
  LocalContext = PickContext<T>,
>(task: (scopedContext: LocalContext) => ListrTask<LocalContext>) {
  return (fullContext: LocalContext) => task(fullContext)
}
