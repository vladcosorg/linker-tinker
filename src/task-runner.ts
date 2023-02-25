import process from 'node:process'

import { Manager } from 'listr2'

import type { BaseContext } from '@/lib/context'
import { debugConsole } from '@/lib/debug'
import { prepareStdin } from '@/lib/stdin'

import type {
  ListrBaseClassOptions,
  ListrRendererValue,
  ListrTask,
  ListrGetRendererClassFromValue,
} from 'listr2'

export async function runTasks<
  T extends Record<string, any>,
  O extends ListrBaseClassOptions<T, ListrRendererValue>,
>(
  tasks: O extends ListrBaseClassOptions<infer A, ListrRendererValue>
    ? (
        context: A,
      ) => Array<
        ListrTask<A, ListrGetRendererClassFromValue<ListrRendererValue>>
      >
    : never,
  options: O,
): Promise<Manager<O['ctx'], NonNullable<O['renderer']>>> {
  const manager = new Manager({
    concurrent: false,
    rendererOptions: {
      collapse: options.ctx?.['verbose'] !== true,
      collapseErrors: false,
      showErrorMessage: true,
      collapseSkips: false,
    },
    ...options,
  })
  manager.add(tasks)

  debugConsole.log('Running task runner with configuration', manager.options)
  prepareStdin(manager.options?.ctx as unknown as BaseContext)

  try {
    await manager.runAll()
  } catch {
    await manager.run(manager.options?.ctx['rollbackQueue'])
  } finally {
    process.exit(0)
  }
}
