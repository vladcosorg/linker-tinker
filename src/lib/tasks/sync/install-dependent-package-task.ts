import path from 'node:path'

import jetpack from 'fs-jetpack'

import { runNpmInstall, runNpmUninstall } from '@/lib/executor'
import { getIntermediatePath } from '@/lib/misc'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const installDependentPackageTask = createTask(
  (
    context: PickContext<
      | 'dependentPackageName'
      | 'intermediateCacheDirectory'
      | 'isExiting'
      | 'targetPackagePath'
    >,
    title: string = 'Installing the package',
  ) => ({
    enabled() {
      return !context.isExiting
    },
    title,
    task: async (_, task): Promise<void> => {
      if (
        jetpack.exists(
          path.join(
            context.targetPackagePath,
            'node_modules',
            context.dependentPackageName,
          ),
        )
      ) {
        const uninstallProcess = runNpmUninstall(
          context.targetPackagePath,
          context.dependentPackageName,
          false,
        )
        uninstallProcess.all?.pipe(task.stdout())
        await uninstallProcess
      }

      const process = runNpmInstall(
        context.targetPackagePath,
        getIntermediatePath(
          context.dependentPackageName,
          context.intermediateCacheDirectory,
        ),
      )
      process.all?.pipe(task.stdout())

      await process
    },
  }),
)
