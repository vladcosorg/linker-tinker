import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const runRollbackTasks = createTask(() => ({
  title: 'Running rollback tasks',
  enabled(context: PickContext<'rollbackQueue'>) {
    return context.rollbackQueue.length > 0
  },
  task(context: PickContext<'rollbackQueue'>, task) {
    return task.newListr(context.rollbackQueue)
  },
}))
