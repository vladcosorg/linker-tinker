import { registerNewActiveRun } from '@/lib/persistent-storage'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function initializeStorageTask(): ContextualTaskWithRequired<
  'dependentPackageName' | 'isExiting' | 'onlyAttach'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },
    title: 'Initialise storage',
    task: (context) => {
      registerNewActiveRun(context)
    },
  }
}
