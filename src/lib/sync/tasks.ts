import path from 'node:path'
import process from 'node:process'

import jetpack from 'fs-jetpack'
import { Manager } from 'listr2'

import { terminate } from '@/lib/child-process'
import { eventBus } from '@/lib/event-emitter'
import type { getInstalledPackageConfiguration } from '@/lib/misc'
import { prepareStdin } from '@/lib/stdin'
import { backupInstalledVersion } from '@/lib/sync/subtasks/backup-installed-version'
import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
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
  intermediatePackagePath: string
  syncPaths: string[] | string
  runWatcherScript: string | undefined
  debug: boolean
  bidirectionalSync: boolean
  isExiting: boolean
  skipWatch: boolean
  noSymlink: boolean
  watchAll: boolean
  pendingBidirectionalUpdates: { fromSource: string[]; toSource: string[] }
  dependentPackageName: string
  originalPackageConfiguration?: Awaited<
    ReturnType<typeof getInstalledPackageConfiguration>
  >
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
      enabled(context) {
        return !context.isExiting
      },
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
    backupInstalledVersion(),
    {
      enabled(context) {
        return !context.isExiting
      },
      title: 'Finding the files for sync',
      task: (_context, task) =>
        task.newListr((parent) => [
          getPackListTask(parent),
          getFallbackPackList(parent),
        ]),
    },
    {
      enabled(context) {
        return !context.noSymlink
      },
      title: 'Creating intermediate package',
      task: async (context, task) => {
        if (Array.isArray(context.syncPaths)) {
          await Promise.all(
            context.syncPaths.map(async (filePath) =>
              jetpack.copyAsync(
                path.join(context.sourcePackagePath, filePath),
                path.join(context.intermediatePackagePath, filePath),
                {
                  overwrite: true,
                },
              ),
            ),
          )
        }
      },
    },
    {
      enabled(context) {
        return !context.isExiting && context.noSymlink
      },
      title: 'Dependent package installation in the the host package',
      task: (_context, task) =>
        task.newListr([installTheDependentPackageTask()], {
          concurrent: false,
        }),
    },
    {
      enabled(context) {
        return !context.noSymlink
      },
      title: 'Creating symlink',
      task: async (context, task) => {
        await jetpack.symlinkAsync(
          context.targetPackagePath,
          context.intermediatePackagePath,
        )
      },
    },
    {
      enabled(context) {
        return !context.skipWatch && !context.isExiting
      },
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

  eventBus.on('exit', () => {
    // @ts-expect-error TS being too cautious
    manager.options.ctx.isExiting = true
  })

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
