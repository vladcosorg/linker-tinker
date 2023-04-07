import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'
import { getFallbackPackList } from '@/lib/tasks/sync/get-fallback-packlist-task'
import { getGranularPackListTask } from '@/lib/tasks/sync/get-granular-pack-list-task'

export const getPackListTask = createTask(
  (
    context: PickContext<
      | 'debug'
      | 'isExiting'
      | 'onlyAttach'
      | 'sourcePackagePath'
      | 'syncPaths'
      | 'watchAll'
    >,
  ) => ({
    enabled() {
      return !context.isExiting
    },
    title: 'Finding the files for sync',
    task(_, task) {
      return task.newListr((parent) => [
        getGranularPackListTask(context, parent),
        getFallbackPackList(context, parent),
      ])
    },
  }),
)
