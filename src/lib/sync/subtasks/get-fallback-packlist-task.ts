import { ListrTask } from 'listr2'

import { Context } from '@/lib/sync/tasks'

export function getFallbackPackList(): ListrTask<Context> {
  return {
    title:
      'Could not get the listr. Falling back to syncing the whole directory.',
    task: (context, task) => {
      context.syncPaths = context.sourcePackagePath
    },
    enabled: (context) => typeof context.syncPaths === 'string',
  }
}
