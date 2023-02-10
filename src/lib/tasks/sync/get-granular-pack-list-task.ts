import chalk from 'chalk'

import type { RequiredContext } from '@/lib/context'
import { getPackList } from '@/lib/packlist'
import type { ContextualTask, ParentTask } from '@/lib/tasks'

type LocalContext = RequiredContext<
  'debug' | 'sourcePackagePath' | 'syncPaths' | 'watchAll'
>
export function getGranularPackListTask(
  parent: ParentTask<LocalContext>,
): ContextualTask<LocalContext> {
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
    exitOnError: false,
  }
}
