import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfThePathExistsTask } from '@/lib/sync/subtasks/check-if-the-path-exists-task'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function verifyDependencyTask(): ContextualTaskWithRequired<
  'dependentPackageName' | 'isExiting' | 'sourcePackagePath'
> {
  return {
    enabled(context) {
      return !context.isExiting
    },
    title: 'Verifying the dependent package',
    task: (context, task) =>
      task.newListr((parent) => [
        checkIfThePathExistsTask(context.sourcePackagePath),
        checkIfIsValidNodePackageTask(context.sourcePackagePath, parent, false),
      ]),
  }
}
