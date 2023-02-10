import { attachActiveRun } from '@/lib/persistent-storage'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function backupInstalledVersion(): ContextualTaskWithRequired<
  'dependentPackageName' | 'targetPackagePath'
> {
  return {
    title: 'Saving original package configuration',
    task: async ({
      dependentPackageName,
      targetPackagePath,
    }): Promise<void> => {
      await attachActiveRun({ dependentPackageName, targetPackagePath })
    },
  }
}
