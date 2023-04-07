import chalk from 'chalk'

import { getPackList } from '@/lib/packlist'
import type { ParentTask, PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

type LocalContext = PickContext<
  'debug' | 'sourcePackagePath' | 'syncPaths' | 'watchAll'
>

export const getGranularPackListTask = createTask(
  (context: LocalContext, parent: ParentTask<LocalContext>) => ({
    title: "Extracting the files from the 'npm pack' command",
    enabled() {
      return !context.watchAll
    },

    task: async () => {
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
    exitOnError: false,
  }),
)
