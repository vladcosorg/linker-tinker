import {
  ListrBaseClassOptions,
  ListrRendererValue,
  ListrTask,
  Manager,
} from 'listr2'

import { checkIfIsValidNodePackageTask } from '@/commands/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfSourcePackageInstalledTask } from '@/commands/sync/subtasks/check-if-source-package-installed-task'
import { checkIfThePathExistsTask } from '@/commands/sync/subtasks/check-if-the-path-exists-task'
import { getFallbackPackList } from '@/commands/sync/subtasks/get-fallback-packlist-task'
import { getPackListTasker } from '@/commands/sync/subtasks/get-pack-list-task'
import { installTheDependentPackageTask } from '@/commands/sync/subtasks/install-dependent-package-task'
import { startWatcherTask } from '@/commands/sync/subtasks/start-watcher-task'

export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
  syncPaths: string[] | string
}

function getTasks(): Array<ListrTask<Context>> {
  return [
    {
      title: 'Source package verification',
      task: (context, task) => {
        task.newListr<Context>(
          [
            checkIfThePathExistsTask(context.sourcePackagePath),
            checkIfIsValidNodePackageTask(context.sourcePackagePath),
          ],
          { concurrent: false },
        )
      },
    },
    {
      title: 'Target package verification',
      task: (context, task) =>
        task.newListr(
          [
            checkIfThePathExistsTask(context.targetPackagePath),
            checkIfIsValidNodePackageTask(context.targetPackagePath),
          ],
          { concurrent: false },
        ),
    },
    {
      enabled: true,
      title: 'Dependent package installation in the the host package',
      task: (context, task) =>
        task.newListr(
          [
            checkIfSourcePackageInstalledTask(),
            installTheDependentPackageTask(),
          ],
          {
            concurrent: false,
          },
        ),
    },
    {
      title: 'Finding the files for sync',
      task: (context, task) =>
        task.newListr([getPackListTasker(), getFallbackPackList()], {
          concurrent: false,
          exitOnError: false,
          rendererOptions: { collapseErrors: false },
        }),
    },
    startWatcherTask(),
  ]
}

export async function runTasks<
  O extends ListrBaseClassOptions<Context, ListrRendererValue>,
>(override: O): Promise<Manager<O['ctx'], NonNullable<O['renderer']>>> {
  const manager = new Manager({
    concurrent: false,
    registerSignalListeners: false,
    rendererOptions: {
      collapse: false,
      collapseSkips: false,
    },
    ...override,
  })
  manager.add(getTasks())
  await manager.runAll()

  return manager
}
