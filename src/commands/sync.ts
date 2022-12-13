import path from 'node:path'

import { Command, Flags } from '@oclif/core'
import { watch } from 'chokidar'
import fs from 'fs-extra'
import { Listr, ListrTask } from 'listr2'
import notifier from 'node-notifier'

import { deferred } from '@/lib/deferred'
import { removeFileAndContainingDirectoryIfEmpty } from '@/lib/fs'
import {
  copyFile,
  formatPathToRelative,
  getPackageName,
  getPackList,
  getTargetPath,
  installPackage,
  isPackageInstalled,
} from '@/lib/misc'
import { createTaskFactory } from '@/lib/tasks'

interface Context {
  sourcePackagePath: string
  targetPackagePath: string
  syncPaths: string[] | string
}

export default class Sync extends Command {
  static override description = 'Start syncing the directory'
  static override args = [
    { name: 'from', description: 'Source package', required: true },
    { name: 'to', description: 'Target package', required: true },
  ] satisfies NonNullable<typeof Command['args']>

  static override flags = {
    verbose: Flags.boolean({ char: 'v' }),
  }

  async run(): Promise<void> {
    const input = await this.parse(Sync)
    const inputArguments = input.args as Record<'from' | 'to', string>
    const inputFlags = input.flags
    const tasks = createTaskFactory<Context>({
      renderer: inputFlags.verbose ? 'simple' : 'default',
    })

    tasks.ctx = {
      sourcePackagePath: path.resolve(inputArguments.from),
      targetPackagePath: path.resolve(inputArguments.to),
      syncPaths: path.resolve(inputArguments.from),
    }

    tasks.add([
      {
        title: 'Source package verification',
        task: (context, task): Listr =>
          task.newListr(
            [
              this.checkIfThePathExists(context.sourcePackagePath),
              this.checkIfIsValidNodePackage(context.sourcePackagePath),
            ],
            { concurrent: false },
          ),
      },
      {
        title: 'Target package verification',
        task: (context, task): Listr =>
          task.newListr(
            [
              this.checkIfThePathExists(context.targetPackagePath),
              this.checkIfIsValidNodePackage(context.targetPackagePath),
            ],
            { concurrent: false },
          ),
      },
      {
        title: 'Dependent package installation in the the host package',
        task: (context, task): Listr =>
          task.newListr(
            [
              this.checkIfSourcePackageInstalled(),
              this.installTheDependentPackage(),
            ],
            {
              concurrent: false,
            },
          ),
      },
      {
        title: 'Finding the files for sync',
        task: (context, task): Listr =>
          task.newListr([this.getPackList(), this.getFallbackPackList()], {
            concurrent: false,
            exitOnError: false,
            rendererOptions: { collapseErrors: false },
          }),
      },
      this.startWatcher(),
    ])

    await tasks.runAll()
  }

  private startWatcher(): ListrTask<Context> {
    function createIntermediateTask(list: Listr<Context, any, any>): {
      resolve: (value: string) => void
      reject: (value: string) => void
    } {
      const { resolve, reject, promise } = deferred<string>()
      list.add([
        {
          title: 'Waiting for changes',
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

    return {
      title: 'Starting watching the files',
      task: (context, task) => {
        const newList = task.newListr([], { exitOnError: false })

        let { resolve, reject } = createIntermediateTask(newList)
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
                      this.installTheDependentPackage(
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

  private checkIfThePathExists(userPath: string): ListrTask<Context> {
    return {
      title: 'Checking if the path exists and is a directory',
      task: async () => {
        const stat = await fs.lstat(userPath)

        if (!stat.isDirectory()) {
          throw new Error('The provided path is not a directory')
        }
      },
    }
  }

  private checkIfIsValidNodePackage(packagePath: string): ListrTask {
    return {
      title: 'Checking if the path is a valid node package',
      task: async (context, task): Promise<void> => {
        const name = await getPackageName(packagePath)
        task.output = `Found package ${name}`
      },
      options: { persistentOutput: true },
    }
  }

  private checkIfSourcePackageInstalled(): ListrTask<Context> {
    return {
      title: 'Checking if the source package is already installed',
      task: async (context, task): Promise<void> => {
        await isPackageInstalled(
          context.targetPackagePath,
          await getPackageName(context.sourcePackagePath),
        )
      },
    }
  }

  private installTheDependentPackage(
    title = 'Installing the package',
  ): ListrTask<Context> {
    return {
      title,
      task: async (context, task): Promise<void> => {
        await installPackage(
          context.targetPackagePath,
          context.sourcePackagePath,
        )
      },
    }
  }

  private getPackList(): ListrTask<Context> {
    return {
      title: "Extracting the files from the 'npm pack' command",
      task: async (context, task) => {
        context.syncPaths = await getPackList(context.sourcePackagePath)
        // console.log(context.syncPaths)
        task.output = `Found ${context.syncPaths.length} files for sync`
      },
      options: {
        exitOnError: false,
      },
    }
  }

  private getFallbackPackList(): ListrTask<Context> {
    return {
      title:
        'Could not get the listr. Falling back to syncing the whole directory.',
      task: (context, task) => {
        context.syncPaths = context.sourcePackagePath
      },
      enabled: (context) => typeof context.syncPaths === 'string',
    }
  }
}