import { registerNewActiveRun } from '@/lib/persistent-storage'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const initializeStorageTask = createTask(
  (
    context: PickContext<
      'dependentPackageName' | 'foregroundWatcher' | 'isExiting' | 'onlyAttach'
    >,
  ) => ({
    enabled() {
      return !context.isExiting
    },
    title: 'Initialise storage',
    task() {
      registerNewActiveRun(context)
    },
  }),
)
