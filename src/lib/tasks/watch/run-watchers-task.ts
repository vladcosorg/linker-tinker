import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { maybeRunDependencyWatcherTask } from '@/lib/tasks/sync/maybe-run-dependency-watcher-task'
import { startReverseWatcherTask } from '@/lib/tasks/sync/start-reverse-watcher-task'
import { startWatcherTask } from '@/lib/tasks/sync/start-watcher-task'

export function runWatchersTask(): ContextualTaskWithRequired<
  | 'bidirectionalSync'
  | 'debug'
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
    enabled(context) {
      return !context.skipWatch && !context.isExiting && !context.onlyAttach
    },
    title: 'Running watchers',

    task: (_context, task): any =>
      task.newListr(
        [
          startWatcherTask(),
          startReverseWatcherTask(),
          maybeRunDependencyWatcherTask(),
        ],
        {
          concurrent: true,
        },
      ),
  }
}
