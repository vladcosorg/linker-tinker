import chalk from 'chalk'

import { eventBus } from '@/lib/event-emitter'
import { removeLinkedVersion } from '@/lib/sync/subtasks/remove-linked-version'
import { restoreOriginalVersion } from '@/lib/sync/subtasks/restore-original-version'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function gracefulExitTask(): ListrTask<Context> {
  return {
    title: chalk.grey(
      `Press ${chalk.red('q')} to close all the subprocesses and exit.`,
    ),
    task: (_context, task) => {
      eventBus.on('exit', () => {
        task.title = `Press  ${chalk.bold.red(
          'CTRL+C',
        )} to close the application immediately.`
      })

      return task.newListr([restoreOriginalVersion(), removeLinkedVersion()])
    },
  }
}
