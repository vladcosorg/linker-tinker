import chalk from 'chalk'

import {
  getPackageName,
  getPackageNiceName,
  validateDependentPackage,
  validateRootPackage,
} from '@/lib/misc'
import type { ParentTask, PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

type LocalContext = PickContext<'dependentPackageName'>
export const checkIfIsValidNodePackageTask = createTask(
  (
    context: LocalContext,
    {
      packagePath,
      parentTask,
      isRoot,
    }: {
      packagePath: () => string
      parentTask?: ParentTask<LocalContext>
      isRoot: boolean
    },
  ) => ({
    title: 'Checking if the path is a valid node package',
    task: async (_, task) => {
      const path = packagePath()
      // eslint-disable-next-line no-unused-expressions
      isRoot
        ? await validateRootPackage(path)
        : await validateDependentPackage(path)

      if (!isRoot) {
        context.dependentPackageName = await getPackageName(path)
      }

      const name = await getPackageNiceName(path)

      task.output = `Found package ${name}`

      if (parentTask) {
        parentTask.title += ` [${
          isRoot ? chalk.green(name) : chalk.blue(name)
        }]`
      }
    },
  }),
)
