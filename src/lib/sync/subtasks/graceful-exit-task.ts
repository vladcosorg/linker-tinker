import { execNpm } from '@/lib/child-process'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function gracefulExitTask(): ListrTask<Context> {
  return {
    task: (context, task) => {
      task.title = 'Graceful exit'
      return task.newListr([
        {
          title: 'Reverting to the previous package version',
          task: async (_context) => {
            await execNpm('install', {
              cwd: context.targetPackagePath,
            })
          },
        },
      ])
    },
  }
}
