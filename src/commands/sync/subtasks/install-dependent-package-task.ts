import { ListrTask } from 'listr2'

import { Context } from '@/commands/sync/tasks'
import { installPackage } from '@/lib/misc'

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
