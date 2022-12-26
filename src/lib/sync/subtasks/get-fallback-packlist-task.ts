import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function getFallbackPackList(): ListrTask<Context> {
  return {
    title:
      'Could not get the listr. Falling back to syncing the whole directory.',
    task: (context) => {
      context.syncPaths = context.sourcePackagePath
    },
    enabled: (context) => typeof context.syncPaths === 'string',
  }
}
