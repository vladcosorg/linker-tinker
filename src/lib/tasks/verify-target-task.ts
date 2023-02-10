import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfThePathExistsTask } from '@/lib/sync/subtasks/check-if-the-path-exists-task'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function verifyTargetTask(): ContextualTaskWithRequired<
  'dependentPackageName' | 'isExiting' | 'targetPackagePath'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },
    title: 'Verifying the root package',
    task: (context, task) =>
      task.newListr((parent) => [
        checkIfThePathExistsTask(context.targetPackagePath),
        checkIfIsValidNodePackageTask(context.targetPackagePath, parent, true),
      ]),
  }
}
