import chalk from 'chalk'

import type { ParentTask, PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

type LocalContext = PickContext<'sourcePackagePath' | 'syncPaths'>

export const getFallbackPackList = createTask(
  (context: LocalContext, parent: ParentTask<LocalContext>) => ({
    title:
      'Could not get the listr. Falling back to syncing the whole directory.',
    task: () => {
      context.syncPaths = context.sourcePackagePath
      parent.title += chalk.grey(
        ` [Attention: all the ${chalk.bold(
          context.syncPaths,
        )} directory is being watched for changes. It is recommended that you watch only specific files.]`,
      )
    },
    enabled: () => typeof context.syncPaths === 'string',
  }),
)
