import type { ContextualTaskWithRequired } from '@/lib/tasks'
import { getFallbackPackList } from '@/lib/tasks/sync/get-fallback-packlist-task'
import { getGranularPackListTask } from '@/lib/tasks/sync/get-granular-pack-list-task'

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
