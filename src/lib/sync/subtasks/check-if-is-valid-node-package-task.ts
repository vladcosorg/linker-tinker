import path from 'node:path'

import chalk from 'chalk'

import {
  getPackageName,
  getPackageNiceName,
  validateDependentPackage,
  validateRootPackage,
} from '@/lib/misc'
import type { ParentTask, Task } from '@/lib/sync/tasks'

export function checkIfIsValidNodePackageTask(
  packagePath: string,
  parentTask: ParentTask,
  isRoot: boolean,
): Task {
  return {
    title: 'Checking if the path is a valid node package',
    task: async (context, task): Promise<void> => {
      // eslint-disable-next-line no-unused-expressions
      isRoot
        ? await validateRootPackage(packagePath)
        : await validateDependentPackage(packagePath)

      if (!isRoot) {
        context.dependentPackageName = await getPackageName(packagePath)
        context.intermediatePackagePath = path.join(
          context.targetPackagePath,
          '.linker-tinker',
          context.dependentPackageName,
        )
      }

      const name = await getPackageNiceName(packagePath)

      task.output = `Found package ${name}`
      parentTask.title += ` [${isRoot ? chalk.green(name) : chalk.blue(name)}]`
    },
  }
}
