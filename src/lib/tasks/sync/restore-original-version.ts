import { runNpmInstall, runNpmUninstall } from '@/lib/executor'
import {
  getActiveRunsForPackage,
  resetActiveRunsForPackage,
} from '@/lib/persistent-storage'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

import type { ExecaChildProcess } from 'execa'

export const restoreOriginalVersion = createTask(
  (context: PickContext<'dependentPackageName' | 'onlyAttach'>) => ({
    enabled() {
      return !context.onlyAttach
    },
    title: 'Restoring original version',
    task: async (_, task): Promise<void> => {
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
  }),
)
