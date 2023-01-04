import path from 'node:path'

import chalk from 'chalk'
import { watch } from 'chokidar'
import notifier from 'node-notifier'

import { deferred } from '@/lib/deferred'
import { toErrorWithMessage } from '@/lib/error'
import { eventBus } from '@/lib/event-emitter'
import { removeFileAndContainingDirectoryIfEmpty } from '@/lib/fs'
import { copyFile, formatPathToRelative, getTargetPath } from '@/lib/misc'
import { getPackList } from '@/lib/packlist'
import { installTheDependentPackageTask } from '@/lib/sync/subtasks/install-dependent-package-task'
import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

function createIntermediateTask(): {
  resolve: (value?: string) => void
  reject: ReturnType<typeof deferred>['reject']
  task: ListrTask<Context>
} {
  const { resolve, reject, promise } = deferred<string | undefined>()
  return {
    task: {
      title:
        'Waiting for changes (press q to exit and restore the original package contents)',
      task: async (_context, task) => {
        const promiseResult = await promise
        if (promiseResult) {
          task.title = promiseResult
        }
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
    options: {
      bottomBar: 5,
    },
    title: 'Starting watching the files',
    task: (context, task) => {
      const newList = task.newListr([], { exitOnError: false })
      let intermediateTask = createIntermediateTask()
      newList.add(intermediateTask.task)

      const watcher = watch(context.sourcePackagePath, {
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
                  sourcePath
                ) {
                  newList.add(
                    installTheDependentPackageTask(
                      'Detected changes in source package.json. Reinstalling the package to pick up possible (peer)dependency changes.',
                    ),
                  )
                  intermediateTask.resolve()
                  intermediateTask = createIntermediateTask()
                  newList.add(intermediateTask.task)
                }

                task.output = `Copied from ${chalk.blue(
                  formatPathToRelative(context.sourcePackagePath, sourcePath),
                )} to ${chalk.green(
                  formatPathToRelative(context.targetPackagePath, targetPath),
                )}`

                break
              }

              case 'unlink': {
                await removeFileAndContainingDirectoryIfEmpty(targetPath)
                task.output = `Removed ${targetPath}`
                break
              }

              default: {
                throw new Error(`Unknown event ${eventName}`)
              }
            }
          })
          .catch((error) => {
            const knownError = toErrorWithMessage(error)
            notifier.notify({
              title: 'linkandtink',
              message: knownError.message,
            })

            intermediateTask.reject(knownError)
            intermediateTask = createIntermediateTask()
          })
      })

      eventBus.on('exit', async () => {
        await watcher.close()
        intermediateTask.resolve()
      })

      return newList
    },
  }
}
