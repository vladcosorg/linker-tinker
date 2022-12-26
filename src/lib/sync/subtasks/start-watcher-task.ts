import path from 'node:path'

import { watch } from 'chokidar'
import notifier from 'node-notifier'

import { deferred } from '@/lib/deferred'
import { removeFileAndContainingDirectoryIfEmpty } from '@/lib/fs'
import { copyFile, formatPathToRelative, getTargetPath } from '@/lib/misc'
import { getPackList } from '@/lib/packlist'
import { listenToQuitKey } from '@/lib/stdin'
import { installTheDependentPackageTask } from '@/lib/sync/subtasks/install-dependent-package-task'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

function createIntermediateTask(): {
  resolve: (value: string) => void
  reject: (value: string) => void
  task: ListrTask<Context>
} {
  const { resolve, reject, promise } = deferred<string>()
  return {
    task: {
      title:
        'Waiting for changes (press q to exit and restore the original package contents)',
      task: async (_context, task) => {
        task.title = await promise
      },
      options: {
        exitOnError: false,
      },
    },
    resolve,
    reject,
  }
}

export function startWatcherTask(): ListrTask<Context> {
  return {
    title: 'Starting watching the files',
    task: (context, task) => {
      const newList = task.newListr([], { exitOnError: false })

      let intermediateTask = createIntermediateTask()
      newList.add(intermediateTask.task)

      listenToQuitKey(() => {
        intermediateTask.resolve('Triggered graceful exit')
        newList.add([
          {
            title: 'Graceful',
            task: () => {
              // eslint-disable-next-line no-process-exit,unicorn/no-process-exit
              process.exit(1)
            },
          },
        ])
      })

      watch(context.sourcePackagePath, {
        ignoreInitial: true,
        persistent: true,
        ignored: ['**/.git/**', '**/node_modules/**'],
      }).on('all', (eventName, sourcePath) => {
        getTargetPath(
          sourcePath,
          context.sourcePackagePath,
          context.targetPackagePath,
        )
          .then(async (targetPath) => {
            if (eventName === 'add') {
              context.syncPaths = await getPackList(context.sourcePackagePath)
            }

            if (
              !context.syncPaths.includes(
                path.relative(context.sourcePackagePath, sourcePath),
              )
            ) {
              return
            }

            switch (eventName) {
              case 'add':
              case 'change': {
                await copyFile(sourcePath, targetPath)

                if (
                  path.join(context.sourcePackagePath, 'package.json') ===
                  targetPath
                ) {
                  newList.add(
                    installTheDependentPackageTask(
                      'Detected changes in source package.json. Reinstalling the package to pick up possible (peer)dependency changes.',
                    ),
                  )
                }

                intermediateTask.resolve(
                  `Copied from ${formatPathToRelative(
                    context.sourcePackagePath,
                    sourcePath,
                  )} to ${formatPathToRelative(
                    context.targetPackagePath,
                    targetPath,
                  )}`,
                )
                intermediateTask = createIntermediateTask()
                newList.add(intermediateTask.task)
                break
              }

              case 'unlink': {
                await removeFileAndContainingDirectoryIfEmpty(targetPath)
                intermediateTask.resolve(`Removed ${targetPath}`)
                intermediateTask = createIntermediateTask()
                newList.add(intermediateTask.task)
                break
              }

              default: {
                throw new Error(`Unknown event ${eventName}`)
              }
            }
          })
          .catch((error) => {
            notifier.notify({
              title: 'linkandtink',
              message: `An error occured. Please check console for more info.`,
            })
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            intermediateTask.reject(error)
            intermediateTask = createIntermediateTask()
          })
      })

      return newList
    },
  }
}
