import { installPackage } from '@/lib/misc'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function installTheDependentPackageTask(
  title = 'Installing the package',
): ListrTask<Context> {
  return {
    title,
    task: async (context): Promise<void> => {
      await installPackage(context.targetPackagePath, context.sourcePackagePath)
    },
  }
}
