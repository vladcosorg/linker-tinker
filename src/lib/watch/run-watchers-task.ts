import { getFallbackPackList } from '@/lib/sync/subtasks/get-fallback-packlist-task'
import { getGranularPackListTask } from '@/lib/sync/subtasks/get-granular-pack-list-task'
import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { startWatcherTask } from '@/lib/sync/subtasks/start-watcher-task'
import { startReverseWatcherTask } from '@/lib/sync/subtasks/start-reverse-watcher-task'
import { maybeRunDependencyWatcherTask } from '@/lib/sync/subtasks/maybe-run-dependency-watcher-task'

export function runWatchersTask(): ContextualTaskWithRequired<
  | 'skipWatch'
  | 'isExiting'
  | 'onlyAttach'
  | 'sourcePackagePath'
  | 'syncPaths'
  | 'debug'
  | 'runWatcherScript'
  | 'bidirectionalSync'
  | 'pendingBidirectionalUpdates'
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
