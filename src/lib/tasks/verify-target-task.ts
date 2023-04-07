import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'
import { checkIfIsValidNodePackageTask } from '@/lib/tasks/sync/check-if-is-valid-node-package-task'
import { checkIfThePathExistsTask } from '@/lib/tasks/sync/check-if-the-path-exists-task'

export const verifyTargetTask = createTask(
  (
    context: PickContext<
      'dependentPackageName' | 'isExiting' | 'targetPackagePath'
    >,
  ) => ({
    title: 'Verifying the root package',
    enabled() {
      return !context.isExiting
    },
    task: (_, task) =>
      task.newListr((parentTask) => [
        checkIfThePathExistsTask(context.targetPackagePath),
        checkIfIsValidNodePackageTask(context, {
          isRoot: true,
          parentTask,
          packagePath: context.targetPackagePath,
        }),
      ]),
  }),
)
