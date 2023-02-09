import { getIntermediatePath } from '@/lib/misc'
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
        await getIntermediatePath(context.dependentPackageName),
      )
      process.all?.pipe(task.stdout())
      await process
    },
  }
}
