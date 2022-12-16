import path from 'node:path'

import { watch } from 'chokidar'
import { Listr, ListrTask } from 'listr2'
import notifier from 'node-notifier'

import { deferred } from '@/lib/deferred'
import { removeFileAndContainingDirectoryIfEmpty } from '@/lib/fs'
import { copyFile, formatPathToRelative, getTargetPath } from '@/lib/misc'
import { getPackList } from '@/lib/packlist'
import { listenToQuitKey } from '@/lib/stdin'
import { installTheDependentPackageTask } from '@/lib/sync/subtasks/install-dependent-package-task'
import { Context } from '@/lib/sync/tasks'

function createIntermediateTask(list: Listr<Context, any, any>): {
  resolve: (value: string) => void
  reject: (value: string) => void
} {
  const { resolve, reject, promise } = deferred<string>()
  list.add([
    {
      title:
        'Waiting for changes (press q to exit and restore the original package contents)',
      task: async (context, task) => {
        const result = await promise
        task.title = result
      },
      options: {
        exitOnError: false,
      },
    },
  ])

  return { resolve, reject }
}

export function startWatcherTask(): ListrTask<Context> {
  return {
    title: 'Starting watching the files',
    task: (context, task) => {
      const newList = task.newListr([], { exitOnError: false })

      let { resolve, reject } = createIntermediateTask(newList)

      listenToQuitKey(() => {
        resolve('Triggered graceful exit')
        newList.add([
          {
            title: 'Graceful',
            task: () => {
              process.exit(1)
            },
          },
        ])
      })

      watch(context.sourcePackagePath, {
        ignoreInitial: true,
        persistent: true,
        ignored: ['**/.git/**', '**/node_modules/**'],
      }).on('all', (eventName, sourcePath, stats) => {
        // console.log(eventName)
        void getTargetPath(
          sourcePath,
          context.sourcePackagePath,
          context.targetPackagePath,
        )
          .then(async (targetPath) => {
            if (eventName === 'add') {
              context.syncPaths = await getPackList(context.sourcePackagePath)
            }

            if (!context.syncPaths.includes(sourcePath)) {
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

                resolve(
                  `Copied from ${formatPathToRelative(
                    context.sourcePackagePath,
                    sourcePath,
                  )} to ${formatPathToRelative(
                    context.targetPackagePath,
                    targetPath,
                  )}`,
                )
                ;({ resolve, reject } = createIntermediateTask(newList))
                break
              }

              case 'unlink': {
                await removeFileAndContainingDirectoryIfEmpty(targetPath)
                resolve(`Removed ${targetPath}`)
                ;({ resolve, reject } = createIntermediateTask(newList))
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
            reject(error)
            ;({ resolve, reject } = createIntermediateTask(newList))
          })
      })

      return newList
    },
  }
}
