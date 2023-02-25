import chalk from 'chalk'

import { getActiveRunsForPackage } from '@/lib/persistent-storage'
import { isWatcherRunningForPackage } from '@/lib/pm2'
import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { restoreOriginalVersion } from '@/lib/tasks/sync/restore-original-version'

export function checkIntegrityIssues(): ContextualTaskWithRequired<
  'dependentPackageName' | 'foregroundWatcher' | 'isExiting' | 'onlyAttach'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },
    title: 'Checking for integrity issues',
    task: async (context, task): Promise<any> => {
      const activeRuns = getActiveRunsForPackage(context.dependentPackageName)

      if (!activeRuns) {
        task.title += chalk.green('[OK]')
        return
      }

      const isWatcherRunning = await isWatcherRunningForPackage(
        context.dependentPackageName,
      )

      if (!isWatcherRunning) {
        return task.newListr(restoreOriginalVersion())
      }

      const isForegroundWatcher = context.foregroundWatcher

      if (isForegroundWatcher) {
        return task.newListr(restoreOriginalVersion())
      }

      context.onlyAttach = true
    },
  }
}
