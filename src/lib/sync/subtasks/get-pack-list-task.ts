import { getFallbackPackList } from '@/lib/sync/subtasks/get-fallback-packlist-task'
import { getGranularPackListTask } from '@/lib/sync/subtasks/get-granular-pack-list-task'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function getPackListTask(): ContextualTaskWithRequired<
  | 'debug'
  | 'isExiting'
  | 'onlyAttach'
  | 'sourcePackagePath'
  | 'syncPaths'
  | 'watchAll'
> {
  return {
    enabled(context) {
      return !context.isExiting && !context.onlyAttach
    },
    title: 'Finding the files for sync',
    task(_context, task): any {
      return task.newListr((parent) => [
        getGranularPackListTask(parent),
        getFallbackPackList(parent),
      ])
    },
  }
}
