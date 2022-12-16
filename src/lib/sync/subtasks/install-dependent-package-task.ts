import { ListrTask } from 'listr2'

import { installPackage } from '@/lib/misc'
import { Context } from '@/lib/sync/tasks'

export function installTheDependentPackageTask(
  title = 'Installing the package',
): ListrTask<Context> {
  return {
    title,
    task: async (context, task): Promise<void> => {
      await installPackage(context.targetPackagePath, context.sourcePackagePath)
    },
  }
}
