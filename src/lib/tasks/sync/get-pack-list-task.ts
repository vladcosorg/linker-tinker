import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'
import { getFallbackPackList } from '@/lib/tasks/sync/get-fallback-packlist-task'
import { getGranularPackListTask } from '@/lib/tasks/sync/get-granular-pack-list-task'

export const getPackListTask = createTask(
  (context: PickContext<'sourcePackagePath'>) => ({
    title: 'Cloning repo ',
    task(_, task) {
      return task.newListr((parent) => [
        getGranularPackListTask(context, parent),
        getFallbackPackList(context, parent),
      ])
    },
  }),
)
