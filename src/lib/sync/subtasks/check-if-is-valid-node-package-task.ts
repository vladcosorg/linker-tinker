import chalk from 'chalk'

import {
  getPackageNiceName,
  validateDependentPackage,
  validateRootPackage,
} from '@/lib/misc'
import type { ParentTask } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function checkIfIsValidNodePackageTask(
  packagePath: string,
  parentTask: ParentTask,
  isRoot: boolean,
): ListrTask {
  return {
    title: 'Checking if the path is a valid node package',
    task: async (_context, task): Promise<void> => {
      // eslint-disable-next-line no-unused-expressions
      isRoot
        ? await validateRootPackage(packagePath)
        : await validateDependentPackage(packagePath)

      const name = await getPackageNiceName(packagePath)

      task.output = `Found package ${name}`
      parentTask.title += ` [${isRoot ? chalk.green(name) : chalk.blue(name)}]`
    },
  }
}
