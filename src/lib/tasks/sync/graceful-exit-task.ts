import chalk from 'chalk'

import { eventBus } from '@/lib/event-emitter'
import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { restoreOriginalVersion } from '@/lib/tasks/sync/restore-original-version'

export function gracefulExitTask(): ContextualTaskWithRequired<
  'dependentPackageName' | 'onlyAttach'
> {
  return {
    enabled(context) {
      return !context.onlyAttach
    },
    title: chalk.grey(
      `Press ${chalk.red('q')} to close all the subprocesses and exit.`,
    ),
    task(_context, task): any {
      eventBus.on('exit', () => {
        task.title = `Press  ${chalk.bold.red(
          'CTRL+C',
        )} to close the application immediately.`
      })

      return task.newListr([restoreOriginalVersion()])
    },
  }
}
