import { attachActiveRun } from '@/lib/persistent-storage'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const backupInstalledVersion = createTask(
  (context: PickContext<'dependentPackageName' | 'targetPackagePath'>) => ({
    title: 'Saving original package configuration',
    async task() {
      await attachActiveRun(context)
    },
  }),
)
