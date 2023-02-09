import process from 'node:process'

import { Manager } from 'listr2'

import type { BaseContext } from '@/lib/context'
import { prepareStdin } from '@/lib/stdin'

import type {
  ListrBaseClassOptions,
  ListrRendererValue,
  ListrTask,
} from 'listr2'

export async function runTasks<
  T,
  O extends ListrBaseClassOptions<T, ListrRendererValue>,
>(
  tasks: O extends ListrBaseClassOptions<infer A, ListrRendererValue>
    ? Array<ListrTask<A>>
    : never,
  options: O,
): Promise<Manager<O['ctx'], NonNullable<O['renderer']>>> {
  const manager = new Manager({
    concurrent: false,
    rendererOptions: {
      collapse: true,
      collapseErrors: false,
      showErrorMessage: true,
      collapseSkips: false,
    },
    ...options,
  })
  manager.add(tasks)

  prepareStdin(manager.options?.ctx as BaseContext)

  try {
    await manager.runAll()
  } finally {
    process.exit(0)
  }
}
