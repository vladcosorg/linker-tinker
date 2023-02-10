import Link from '@/commands/link'
import { getPackListTask } from '@/lib/sync/subtasks/get-pack-list-task'
import { gracefulExitTask } from '@/lib/sync/subtasks/graceful-exit-task'
import { verifyDependencyTask } from '@/lib/tasks/verify-dependency-task'
import { verifyTargetTask } from '@/lib/tasks/verify-target-task'
import { runWatchersTask } from '@/lib/watch/run-watchers-task'
import { runTasks } from '@/task-runner'

export default class Watch extends Link {
  override async run(): Promise<void> {
    await runTasks(
      [
        verifyDependencyTask(),
        verifyTargetTask(),
        getPackListTask(),
        runWatchersTask(),
        gracefulExitTask(),
      ],
      this.getOptions(),
    )
  }
}
