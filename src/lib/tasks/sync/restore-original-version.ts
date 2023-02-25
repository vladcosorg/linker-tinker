import {
  getActiveRunsForPackage,
  resetActiveRunsForPackage,
} from '@/lib/persistent-storage'
import { runNpmInstall, runNpmUninstall } from '@/lib/run'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

import type { ExecaChildProcess } from 'execa'

export function restoreOriginalVersion(): ContextualTaskWithRequired<
  'dependentPackageName' | 'onlyAttach'
> {
  return {
    enabled(context) {
      return !context.onlyAttach
    },
    title: 'Restoring original version',
    task: async (context, task): Promise<void> => {
      const runs = getActiveRunsForPackage(context.dependentPackageName)
      if (!runs) {
        return
      }

      const commandPromises: ExecaChildProcess[] = []

      for (const [targetPackage, packageConfig] of Object.entries(runs)) {
        const child = packageConfig
          ? runNpmInstall(
              targetPackage,
              context.dependentPackageName,
              packageConfig,
            )
          : runNpmUninstall(targetPackage, context.dependentPackageName)
        child.all?.pipe(task.stdout())
        commandPromises.push(child)
      }

      await Promise.all(commandPromises)
      resetActiveRunsForPackage(context.dependentPackageName)
    },
  }
}
