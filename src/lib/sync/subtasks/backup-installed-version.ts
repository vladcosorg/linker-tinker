import { attachActiveRun } from '@/lib/persistent-storage'
import type { Task } from '@/lib/sync/tasks'

export function backupInstalledVersion(): Task {
  return {
    title: 'Saving original package configuration',
    task: async (context): Promise<void> => {
      await attachActiveRun(context)
    },
  }
}
