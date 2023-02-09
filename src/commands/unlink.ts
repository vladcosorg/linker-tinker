import path from 'node:path'
import process from 'node:process'

import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'

import { BaseCommand } from '@/lib/base-command'
import {
  getActiveRunsForPackage,
  resetActiveRunForPackage,
} from '@/lib/persistent-storage'
import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfThePathExistsTask } from '@/lib/sync/subtasks/check-if-the-path-exists-task'
import { restorePackageOriginalVersion } from '@/lib/sync/subtasks/restore-original-version-package'
import { runTasks } from '@/task-runner'

export default class Unlink extends BaseCommand<typeof Unlink> {
  static override description =
    'Unlink the package and restore to previous state'

  static override args = {
    from: Args.string({
      description: 'Path to a package that you want to unlink',
      required: true,
    }),
    to: Args.string({
      description: `Target package. If not specified, it will use the current cwd`,
      required: false,
      default: process.cwd(),
    }),
  }

  static override flags = {
    aaa: Flags.boolean({
      char: 'v',
      description: 'Display a verbose action list',
      default: false,
    }),
  }

  async run(): Promise<void> {
    await runTasks(
      [
        {
          enabled(context) {
            return !context.isExiting
          },
          title: 'Verifying the dependent package',
          task: (context, task) =>
            task.newListr((parent) => [
              checkIfThePathExistsTask(context.sourcePackagePath),
              checkIfIsValidNodePackageTask(
                context.sourcePackagePath,
                parent,
                false,
              ),
            ]),
        },
        {
          enabled(context) {
            return !context.isExiting
          },
          title: 'Verifying the root package',
          task: (context, task) =>
            task.newListr((parent) => [
              checkIfThePathExistsTask(context.targetPackagePath),
              checkIfIsValidNodePackageTask(
                context.targetPackagePath,
                parent,
                true,
              ),
            ]),
        },
        {
          enabled(context) {
            return !context.isExiting
          },

          task: (context, task) => {
            task.title = `Rolling back to original dependency configuratoon in the package ${chalk.bold(
              context.targetPackagePath,
            )}`

            const runs = getActiveRunsForPackage(context.dependentPackageName)
            if (!runs) {
              throw new Error(
                `The dependency package [${context.dependentPackageName}] is not registered`,
              )
            }

            const packageConfig = runs[context.targetPackagePath]

            if (packageConfig === undefined) {
              throw new Error('There is no such thing')
            }

            resetActiveRunForPackage(
              context.dependentPackageName,
              context.targetPackagePath,
            )

            return task.newListr(
              restorePackageOriginalVersion(
                context.targetPackagePath,
                packageConfig,
              ),
            )
          },
        },
      ],
      {
        renderer: this.getRendererType(),
        ctx: this.createContext({
          sourcePackagePath: path.resolve(this.args.from),
          targetPackagePath: path.resolve(this.args.to),
          dependentPackageName: '',
          onlyAttach: false,
        }),
      },
    )
  }
}
