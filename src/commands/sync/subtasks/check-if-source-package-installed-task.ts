import { ListrTask } from 'listr2'

import { Context } from '@/commands/sync/tasks'
import { getPackageName, isPackageInstalled } from '@/lib/misc'

export function checkIfSourcePackageInstalledTask(): ListrTask<Context> {
  return {
    title: 'Checking if the source package is already installed',
    task: async (context, task): Promise<void> => {
      await isPackageInstalled(
        context.targetPackagePath,
        await getPackageName(context.sourcePackagePath),
      )
    },
  }
}
