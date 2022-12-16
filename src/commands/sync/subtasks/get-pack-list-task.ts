import { ListrTask } from 'listr2'

import { Context } from '@/commands/sync/tasks'
import { getPackList } from '@/lib/packlist'

export function getPackListTasker(): ListrTask<Context> {
  return {
    title: "Extracting the files from the 'npm pack' command",
    task: async (context, task) => {
      context.syncPaths = await getPackList(context.sourcePackagePath)
      // console.log(context.syncPaths)
      task.output = `Found ${context.syncPaths.length} files for sync`
    },
    options: {
      exitOnError: false,
    },
  }
}
