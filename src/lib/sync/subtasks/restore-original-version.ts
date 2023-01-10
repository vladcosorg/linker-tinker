import { runNpmInstall } from '@/lib/run'
import type { Task } from '@/lib/sync/tasks'

export function restoreOriginalVersion(): Task {
  return {
    enabled: (context) => context.originalPackageConfiguration !== undefined,
    title: 'Restoring original version',
    task: async (context, task): Promise<void> => {
      if (!context.originalPackageConfiguration) {
        return
      }

      const child = runNpmInstall(
        context.targetPackagePath,
        context.dependentPackageName,
        {
          versionRange: context.originalPackageConfiguration.versionRange,
          dependencyType: context.originalPackageConfiguration.dependencyType,
        },
      )

      child.all?.pipe(task.stdout())

      await child
    },
  }
}
