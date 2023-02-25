import Link from '@/commands/link'
import { getPackListTask } from '@/lib/tasks/sync/get-pack-list-task'
import { verifyDependencyTask } from '@/lib/tasks/verify-dependency-task'
import { verifyTargetTask } from '@/lib/tasks/verify-target-task'
import { runWatchersTask } from '@/lib/tasks/watch/run-watchers-task'
import { runTasks } from '@/task-runner'

export default class Watch extends Link {
  override async run(): Promise<void> {
    await runTasks(
      [
        verifyDependencyTask(),
        verifyTargetTask(),
        getPackListTask(),
        runWatchersTask(),
      ],
      await this.getOptions(),
    )
  }
}
