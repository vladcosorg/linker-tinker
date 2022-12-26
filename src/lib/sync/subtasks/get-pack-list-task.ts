import { getPackList } from '@/lib/packlist'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function getPackListTask(): ListrTask<Context> {
  return {
    title: "Extracting the files from the 'npm pack' command",
    task: async (context, task) => {
      context.syncPaths = await getPackList(context.sourcePackagePath)
      console.log(context.syncPaths)
      task.output = `Found ${context.syncPaths.length} files for sync`
    },
    options: {
      exitOnError: false,
    },
  }
}
