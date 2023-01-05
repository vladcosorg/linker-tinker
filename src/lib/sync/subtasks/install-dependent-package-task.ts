import { runNpmInstall } from '@/lib/run'
import type { Task } from '@/lib/sync/tasks'

export function installTheDependentPackageTask(
  title = 'Installing the package',
): Task {
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
