import { getPackageName, isPackageInstalled } from '@/lib/misc'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function checkIfSourcePackageInstalledTask(): ListrTask<Context> {
  return {
    title: 'Checking if the source package is already installed',
    task: async (context): Promise<void> => {
      await isPackageInstalled(
        context.targetPackagePath,
        await getPackageName(context.sourcePackagePath),
      )
    },
  }
}
