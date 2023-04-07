import chalk from 'chalk'

import { getActiveRunsForPackage } from '@/lib/persistent-storage'
import { isWatcherRunningForPackage } from '@/lib/pm2'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'
import { restoreOriginalVersion } from '@/lib/tasks/sync/restore-original-version'

export const checkIntegrityIssues = createTask(
  (
    context: PickContext<
      'dependentPackageName' | 'foregroundWatcher' | 'isExiting' | 'onlyAttach'
    >,
  ) => ({
    enabled() {
      return !context.isExiting
    },
    title: 'Checking for integrity issues',
    task: async (_, task): Promise<any> => {
      const activeRuns = getActiveRunsForPackage(context.dependentPackageName)

      if (!activeRuns) {
        task.title += chalk.green('[OK]')
        return
      }

      const isWatcherRunning = await isWatcherRunningForPackage(
        context.dependentPackageName,
      )

      if (!isWatcherRunning) {
        return task.newListr(restoreOriginalVersion(context))
      }

      const isForegroundWatcher = context.foregroundWatcher

      if (isForegroundWatcher) {
        return task.newListr(restoreOriginalVersion(context))
      }

      context.onlyAttach = true
    },
  }),
)
