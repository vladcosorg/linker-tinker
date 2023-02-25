import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function runRollbackTasks(): ContextualTaskWithRequired<'rollbackQueue'> {
  return {
    enabled(context) {
      return context.rollbackQueue.length > 0
    },
    title: 'Running rollback tasks',
    task: async (context, task): Promise<void> =>
      task.newListr(context.rollbackQueue),
  }
}
