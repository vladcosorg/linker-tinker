import chalk from 'chalk'

import {
  getPackageNiceName,
  validateDependentPackage,
  validateRootPackage,
} from '@/lib/misc'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTaskWrapper, ListrTask, ListrDefaultRenderer } from 'listr2'

export function checkIfIsValidNodePackageTask(
  packagePath: string,
  parentTask: Parameters<
    Extract<
      Parameters<
        ListrTaskWrapper<Context, ListrDefaultRenderer>['newListr']
      >[0],
      // eslint-disable-next-line @typescript-eslint/ban-types
      Function
    >
  >[0],
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
      parentTask.title = `${parentTask.title} [${
        isRoot ? chalk.green(name) : chalk.blue(name)
      }]`
    },
    options: { persistentOutput: true },
  }
}
