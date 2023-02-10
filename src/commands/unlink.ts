import path from 'node:path'

import { BaseCommand } from '@/lib/base-command'
import { getInputArgs } from '@/lib/command'
import { verifyDependencyTask } from '@/lib/tasks/verify-dependency-task'
import { verifyTargetTask } from '@/lib/tasks/verify-target-task'
import { rollBackTask } from '@/lib/unlink/roll-back-task'
import { runTasks } from '@/task-runner'

export default class Unlink extends BaseCommand<typeof Unlink> {
  static override description =
    'Unlink the package and restore to previous state'

  static override args = getInputArgs()

  async run(): Promise<void> {
    await runTasks(
      [verifyDependencyTask(), verifyTargetTask(), rollBackTask()],
      {
        renderer: this.getRendererType(),
        ctx: this.createContext({
          sourcePackagePath: path.resolve(this.args.from),
          targetPackagePath: path.resolve(this.args.to),
          dependentPackageName: '',
        }),
      },
    )
  }
}
