import { ListrTask } from 'listr2'

import { getPackageName, isPackageInstalled } from '@/lib/misc'
import { Context } from '@/lib/sync/tasks'

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
