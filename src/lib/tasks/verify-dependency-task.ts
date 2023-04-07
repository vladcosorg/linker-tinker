import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'
import { checkIfIsValidNodePackageTask } from '@/lib/tasks/sync/check-if-is-valid-node-package-task'
import { checkIfThePathExistsTask } from '@/lib/tasks/sync/check-if-the-path-exists-task'

export const verifyDependencyTask = createTask(
  (
    context: PickContext<
      'dependentPackageName' | 'isExiting' | 'sourcePackagePath'
    >,
  ) => ({
    enabled() {
      return !context.isExiting
    },
    title: 'Verifying the dependent package',
    task: (_, task) =>
      task.newListr((parentTask) => [
        checkIfThePathExistsTask(context.sourcePackagePath),
        checkIfIsValidNodePackageTask(context, {
          isRoot: false,
          parentTask,
          packagePath: context.sourcePackagePath,
        }),
      ]),
  }),
)
