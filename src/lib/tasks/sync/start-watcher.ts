import { launchBackgroundWatcher } from '@/lib/pm2'
import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { maybeRunDependencyWatcherTask } from '@/lib/tasks/sync/maybe-run-dependency-watcher-task'
import { startReverseWatcherTask } from '@/lib/tasks/sync/start-reverse-watcher-task'
import { startWatcherTask } from '@/lib/tasks/sync/start-watcher-task'
import { watchUnlinksTask } from '@/lib/tasks/watch/watch-unlinks-task'

export function startWatcher(): ContextualTaskWithRequired<
  | 'bidirectionalSync'
  | 'debug'
  | 'dependentPackageName'
  | 'foregroundWatcher'
  | 'isExiting'
  | 'onlyAttach'
  | 'pendingBidirectionalUpdates'
  | 'runWatcherScript'
  | 'skipWatch'
  | 'sourcePackagePath'
  | 'syncPaths'
  | 'targetPackagePath'
  | 'watchAll'
> {
  return {
    // enabled: async (context) => {
    //   const isWatcherAlreadyRunning = await isWatcherRunningForPackage(
    //     context.dependentPackageName,
    //   )
    //   return !isWatcherAlreadyRunning
    // },
    title: 'Starting watcher',
    task: async (context, task) => {
      if (!context.foregroundWatcher) {
        task.title += ' [in background]'
        return launchBackgroundWatcher(context.dependentPackageName)
      }

      task.title += ' [in foreground]'
      return task.newListr(
        [
          watchUnlinksTask(),
          startWatcherTask(),
          startReverseWatcherTask(),
          maybeRunDependencyWatcherTask(),
        ],
        {
          concurrent: true,
        },
      )
    },
  }
}
