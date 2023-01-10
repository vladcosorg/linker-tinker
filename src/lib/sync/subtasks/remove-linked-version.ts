import { runNpmUninstall } from '@/lib/run'
import type { Task } from '@/lib/sync/tasks'

export function removeLinkedVersion(): Task {
  return {
    enabled: (context) => context.originalPackageConfiguration === undefined,
    title: 'Removing linked version',
    task: async (context): Promise<void> => {
      await runNpmUninstall(
        context.dependentPackageName,
        context.targetPackagePath,
      )
    },
  }
}
