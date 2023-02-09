import path from 'node:path'

import jetpack from 'fs-jetpack'

import { getIntermediatePath } from '@/lib/misc'
import { registerNewActiveRun } from '@/lib/persistent-storage'
import { backupInstalledVersion } from '@/lib/sync/subtasks/backup-installed-version'
import { checkIfIsValidNodePackageTask } from '@/lib/sync/subtasks/check-if-is-valid-node-package-task'
import { checkIfThePathExistsTask } from '@/lib/sync/subtasks/check-if-the-path-exists-task'
import { createSymlinkTask } from '@/lib/sync/subtasks/create-symlink'
import { getFallbackPackList } from '@/lib/sync/subtasks/get-fallback-packlist-task'
import { getPackListTask } from '@/lib/sync/subtasks/get-pack-list-task'
import { installTheDependentPackageTask } from '@/lib/sync/subtasks/install-dependent-package-task'
import { startBackgroundWatcher } from '@/lib/sync/subtasks/start-background-watcher'

import type { ListrTask, ListrDefaultRenderer, ListrTaskWrapper } from 'listr2'

export interface Context {
  sourcePackagePath: string
  targetPackagePath: string
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
  onlyAttach: boolean
}

export type Task<T = Context> = ListrTask<T, ListrDefaultRenderer>

export type ParentTask<T = Context> = Parameters<
  Extract<
    Parameters<ListrTaskWrapper<T, ListrDefaultRenderer>['newListr']>[0],
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function
  >
>[0]

export function getTasks(): Array<ListrTask<Context>> {
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
    {
      enabled(context) {
        return !context.isExiting
      },
      title: 'Initialise storage',
      task: (context) => {
        registerNewActiveRun(context)
      },
    },
    backupInstalledVersion(),
    {
      enabled(context) {
        return !context.isExiting && !context.onlyAttach
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
        return !context.isExiting && !context.noSymlink && !context.onlyAttach
      },
      title: 'Creating intermediate package',
      task: async (context, task) => {
        if (Array.isArray(context.syncPaths)) {
          await Promise.all(
            context.syncPaths.map(async (filePath) =>
              jetpack.copyAsync(
                path.join(context.sourcePackagePath, filePath),
                path.join(
                  await getIntermediatePath(context.dependentPackageName),
                  filePath,
                ),
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
        return !context.isExiting
      },
      title: 'Dependent package installation in the the host package',
      task: (_context, task) =>
        task.newListr([installTheDependentPackageTask()], {
          concurrent: false,
        }),
    },
    createSymlinkTask(),
    startBackgroundWatcher(),
    // {
    //   enabled(context) {
    //     return !context.skipWatch && !context.isExiting && !context.onlyAttach
    //   },
    //   title: 'Running watchers',
    //
    //   task: (_context, task) =>
    //     task.newListr(
    //       [
    //         startWatcherTask(),
    //         startReverseWatcherTask(),
    //         maybeRunDependencyWatcherTask(),
    //       ],
    //       {
    //         concurrent: true,
    //       },
    //     ),
    // },
  ]
}
