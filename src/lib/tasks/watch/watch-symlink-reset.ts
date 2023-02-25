import { watch } from 'chokidar'

import { eventBus } from '@/lib/event-emitter'
import { assembleInstalledPath } from '@/lib/misc'
import { getActiveRunsForPackage } from '@/lib/persistent-storage'
import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { symlinkTask } from '@/lib/tasks/sync/create-symlink'
import { createPendingTaskList } from '@/lib/watcher'

export function watchSymlinkReset(): ContextualTaskWithRequired<
  'dependentPackageName' | 'isExiting' | 'targetPackagePath'
> {
  return {
    options: {
      bottomBar: 5,
    },
    enabled(context) {
      return !context.isExiting
    },
    title: 'Watching symlink reset',
    async task(context) {
      const pendingTaskList = createPendingTaskList()
      const activeRuns = getActiveRunsForPackage(context.dependentPackageName)
      if (!activeRuns) {
        return
      }

      console.log(activeRuns)
      const watchedPaths = Object.keys(activeRuns).map((rootPath) =>
        assembleInstalledPath(rootPath, '*'),
      )

      const targetPaths = new Set(
        Object.keys(activeRuns).map((rootPath) =>
          assembleInstalledPath(rootPath, context.dependentPackageName),
        ),
      )

      const watcher = watch(watchedPaths, {
        ignoreInitial: true,
        followSymlinks: false,
        depth: 0,
        persistent: true,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
      }).on('addDir', async (sourcePath) => {
        if (!targetPaths.has(sourcePath)) {
          return
        }

        pendingTaskList.addNextTask(symlinkTask.create())
      })

      eventBus.on('exit', async () => {
        await watcher.close()
        pendingTaskList.exit()
      })

      return pendingTaskList.taskList
    },
  }
}
