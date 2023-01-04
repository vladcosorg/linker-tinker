import chalk from 'chalk'

import type { Context, ParentTask } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function getFallbackPackList(parent: ParentTask): ListrTask<Context> {
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
