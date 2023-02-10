import chalk from 'chalk'

import type { RequiredContext } from '@/lib/context'
import type { ContextualTask, ParentTask } from '@/lib/tasks'

type LocalContext = RequiredContext<'sourcePackagePath' | 'syncPaths'>
export function getFallbackPackList(
  parent: ParentTask<LocalContext>,
): ContextualTask<LocalContext> {
  return {
    title:
      'Could not get the listr. Falling back to syncing the whole directory.',
    task: (context) => {
      context.syncPaths = context.sourcePackagePath
      parent.title += chalk.grey(
        ` [Attention: all the ${chalk.bold(
          context.syncPaths,
        )} directory is being watched for changes. It is recommended that you watch only specific files.]`,
      )
    },
    enabled: (context) => typeof context.syncPaths === 'string',
  }
}
