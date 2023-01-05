import process from 'node:process'

import { Manager } from 'listr2'

import { terminate } from '@/lib/child-process'
import { eventBus } from '@/lib/event-emitter'
import { prepareStdin } from '@/lib/stdin'
import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfSourcePackageInstalledTask } from '@/lib/sync/subtasks/check-if-source-package-installed-task'
import { checkIfThePathExistsTask } from '@/lib/sync/subtasks/check-if-the-path-exists-task'
import { getFallbackPackList } from '@/lib/sync/subtasks/get-fallback-packlist-task'
import { getPackListTask } from '@/lib/sync/subtasks/get-pack-list-task'
import { gracefulExitTask } from '@/lib/sync/subtasks/graceful-exit-task'
import { installTheDependentPackageTask } from '@/lib/sync/subtasks/install-dependent-package-task'
import { maybeRunDependencyWatcherTask } from '@/lib/sync/subtasks/maybe-run-dependency-watcher-task'
import { startReverseWatcherTask } from '@/lib/sync/subtasks/start-reverse-watcher-task'
import { startWatcherTask } from '@/lib/sync/subtasks/start-watcher-task'

import type {
  ListrBaseClassOptions,
  ListrRendererValue,
  ListrTask,
  ListrDefaultRenderer,
  ListrTaskWrapper,
} from 'listr2'

export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
  syncPaths: string[] | string
  runWatcherScript: string | undefined
  debug: boolean
  bidirectionalSync: boolean
  watchAll: boolean
  pendingBidirectionalUpdates: { fromSource: string[]; toSource: string[] }
  dependentPackageName: string
}

export type Task = ListrTask<Context, ListrDefaultRenderer>

export type ParentTask = Parameters<
  Extract<
    Parameters<ListrTaskWrapper<Context, ListrDefaultRenderer>['newListr']>[0],
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function
  >
>[0]

function getTasks(): Array<ListrTask<Context>> {
  return [
    {
      title: 'Verifying the dependent package',
      task: (context, task) =>
        task.newListr<Context>((parent) => [
          checkIfThePathExistsTask(context.sourcePackagePath),
          checkIfIsValidNodePackageTask(
            context.sourcePackagePath,
            parent,
            false,
          ),
        ]),
    },
    {
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
        task.newListr((parent) => [
          getPackListTask(parent),
          getFallbackPackList(parent),
        ]),
    },
    {
      enabled: true,
      title: 'Running watchers',

      task: (_context, task) =>
        task.newListr(
          [
            startWatcherTask(),
            startReverseWatcherTask(),
            maybeRunDependencyWatcherTask(),
          ],
          {
            concurrent: true,
          },
        ),
    },
    gracefulExitTask(),
  ]
}

export async function runTasks<
  O extends ListrBaseClassOptions<Context, ListrRendererValue>,
>(override: O): Promise<Manager<O['ctx'], NonNullable<O['renderer']>>> {
  const manager = new Manager({
    concurrent: false,
    rendererOptions: {
      collapse: true,
      collapseErrors: false,
      showErrorMessage: true,
      collapseSkips: false,
    },
    ...override,
  })
  manager.add(getTasks())

  prepareStdin(override.ctx?.debug ?? false)

  eventBus.on('exitImmediately', async () => {
    await terminate(process.pid)
    process.exit(0)
  })

  try {
    await manager.runAll()
  } finally {
    process.exit(0)
  }
}
