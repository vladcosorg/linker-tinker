import chalk from 'chalk'

import { getPackList } from '@/lib/packlist'
import type { Context, ParentTask } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function getPackListTask(parent: ParentTask): ListrTask<Context> {
  return {
    enabled(context) {
      return !context.watchAll
    },
    title: "Extracting the files from the 'npm pack' command",
    task: async (context) => {
      context.syncPaths = await getPackList(context.sourcePackagePath)

      if (context.debug) {
        console.info('Only these files will be synced:', context.syncPaths)
      }

      parent.title += chalk.grey(
        ` [Found ${chalk.bold(
          context.syncPaths.length,
        )} files for sync. Add -d to see the list.]`,
      )
    },
    options: {
      exitOnError: false,
    },
  }
}
