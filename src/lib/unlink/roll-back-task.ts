import chalk from 'chalk'

import {
  getActiveRunsForPackage,
  resetActiveRunForPackage,
} from '@/lib/persistent-storage'
import { restorePackageOriginalVersion } from '@/lib/sync/subtasks/restore-original-version-package'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function rollBackTask(): ContextualTaskWithRequired<
  'dependentPackageName' | 'isExiting' | 'targetPackagePath'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },

    task(context, task): any {
      task.title = `Rolling back to original dependency configuratoon in the package ${chalk.bold(
        context.targetPackagePath,
      )}`

      const runs = getActiveRunsForPackage(context.dependentPackageName)
      if (!runs) {
        throw new Error(
          `The dependency package [${context.dependentPackageName}] is not registered`,
        )
      }

      const packageConfig = runs[context.targetPackagePath]

      if (packageConfig === undefined) {
        throw new Error('There is no such thing')
      }

      resetActiveRunForPackage(
        context.dependentPackageName,
        context.targetPackagePath,
      )
      return task.newListr([
        restorePackageOriginalVersion(context.targetPackagePath, packageConfig),
      ])
    },
  }
}
