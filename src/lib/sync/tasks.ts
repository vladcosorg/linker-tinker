import { Manager } from 'listr2'

import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfSourcePackageInstalledTask } from '@/lib/sync/subtasks/check-if-source-package-installed-task'
import { checkIfThePathExistsTask } from '@/lib/sync/subtasks/check-if-the-path-exists-task'
import { getFallbackPackList } from '@/lib/sync/subtasks/get-fallback-packlist-task'
import { getPackListTask } from '@/lib/sync/subtasks/get-pack-list-task'
import { gracefulExitTask } from '@/lib/sync/subtasks/graceful-exit-task'
import { installTheDependentPackageTask } from '@/lib/sync/subtasks/install-dependent-package-task'
import { startWatcherTask } from '@/lib/sync/subtasks/start-watcher-task'

import type {
  ListrBaseClassOptions,
  ListrRendererValue,
  ListrTask,
} from 'listr2'

export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
  syncPaths: string[] | string
}

function getTasks(): Array<ListrTask<Context>> {
  return [
    {
      title: 'Dependent package',
      task: (context, task) =>
        task.newListr<Context>(
          (parent) => [
            checkIfThePathExistsTask(context.sourcePackagePath),
            checkIfIsValidNodePackageTask(
              context.sourcePackagePath,
              parent,
              false,
            ),
          ],
          { concurrent: false },
        ),
    },
    {
      title: 'Root package',
      task: (context, task) =>
        task.newListr(
          (parent) => [
            checkIfThePathExistsTask(context.targetPackagePath),
            checkIfIsValidNodePackageTask(
              context.targetPackagePath,
              parent,
              true,
            ),
          ],
          { concurrent: false },
        ),
    },
    {
      enabled: true,
      title: 'Dependent package installation in the the host package',
      task: (_context, task) =>
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
      task: (_context, task) =>
        task.newListr([getPackListTask(), getFallbackPackList()], {
          concurrent: false,
          exitOnError: false,
          rendererOptions: { collapseErrors: false },
        }),
    },
    startWatcherTask(),
    gracefulExitTask(),
  ]
}

export async function runTasks<
  O extends ListrBaseClassOptions<Context, ListrRendererValue>,
>(override: O): Promise<Manager<O['ctx'], NonNullable<O['renderer']>>> {
  const manager = new Manager({
    concurrent: false,
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
