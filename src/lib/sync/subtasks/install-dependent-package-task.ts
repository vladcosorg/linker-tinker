import { runNpmInstall } from '@/lib/run'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function installTheDependentPackageTask(
  title = 'Installing the package',
): ListrTask<Context> {
  return {
    title,
    task: async (context, task): Promise<void> => {
      const process = runNpmInstall(
        context.targetPackagePath,
        context.sourcePackagePath,
      )
      process.all?.pipe(task.stdout())
      await process
    },
  }
}
