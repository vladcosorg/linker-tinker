import { getIntermediatePath } from '@/lib/misc'
import { runNpmInstall } from '@/lib/run'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function installTheDependentPackageTask(
  title = 'Installing the package',
): ContextualTaskWithRequired<
  'dependentPackageName' | 'isExiting' | 'targetPackagePath'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },
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
