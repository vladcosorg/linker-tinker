import { getInstalledPackageConfiguration } from '@/lib/misc'
import type { Task } from '@/lib/sync/tasks'

export function backupInstalledVersion(): Task {
  return {
    title: 'Saving original package configuration',
    task: async (context): Promise<void> => {
      context.originalPackageConfiguration =
        await getInstalledPackageConfiguration(
          context.dependentPackageName,
          context.targetPackagePath,
        )
    },
  }
}
