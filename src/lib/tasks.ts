import type { Context, RequiredContext } from '@/lib/context'

import type {
  ListrTaskWrapper,
  ListrDefaultRenderer,
  ListrRendererFactory,
  ListrTask,
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
