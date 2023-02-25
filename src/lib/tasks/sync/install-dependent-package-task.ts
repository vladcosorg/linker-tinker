import path from 'node:path'

import jetpack from 'fs-jetpack'

import { getIntermediatePath } from '@/lib/misc'
import { runNpmInstall, runNpmUninstall } from '@/lib/run'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function installDependentPackageTask(
  title = 'Installing the package',
): ContextualTaskWithRequired<
  | 'dependentPackageName'
  | 'intermediateCacheDirectory'
  | 'isExiting'
  | 'targetPackagePath'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },
    title,
    task: async (context, task): Promise<void> => {
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
  }
}
