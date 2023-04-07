import path from 'node:path'

import chalk from 'chalk'
import { Listr } from 'listr2'
import notifier from 'node-notifier'

import type { Context } from '@/lib/context'
import { debugConsole } from '@/lib/debug'
import { deferred } from '@/lib/deferred'
import { toErrorWithMessage } from '@/lib/error'
import { removeFileAndContainingDirectoryIfEmpty } from '@/lib/fs'
import { copyFile, formatPathToRelative, getOppositePath } from '@/lib/misc'
import type { PickContext } from '@/lib/tasks'
import { symlinkTask } from '@/lib/tasks/sync/create-symlink'
import { installDependentPackageTask } from '@/lib/tasks/sync/install-dependent-package-task'

import type { ListrTask, ListrTaskWrapper, ListrDefaultRenderer } from 'listr2'

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

export function isRecursionEvent(
  filePath: string,
  pendingUpdates: string[],
  contextForDebug: Context,
): boolean {
  const context = contextForDebug
  const debug = contextForDebug.debug

  if (debug) {
    console.log(
      '[Recursion protection]',
      `Is ${filePath} a result of a change in ${getOppositePath(
        filePath,
        context.sourcePackagePath,
        context.dependentPackageName,
        context.targetPackagePath,
      )}`,
    )
  }

  const index = pendingUpdates.indexOf(filePath)
  if (index === -1) {
    if (debug) {
      console.log('[Recursion protection]: No')
    }

    return false
  }

  pendingUpdates.splice(index, 1)
  if (debug) {
    console.log('[Recursion protection]: Yes')
  }

  return true
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createPendingTaskList() {
  const taskList = new Listr([], { exitOnError: false, concurrent: false })
  let currentPendingTask = createIntermediateTask()
  taskList.add(currentPendingTask.task)

  return {
    taskList,
    exit() {
      currentPendingTask.resolve()
    },
    rejectCurrentTask(error: unknown) {
      const newPendingTask = createIntermediateTask()
      taskList.add(newPendingTask.task)
      currentPendingTask.reject(error)
      currentPendingTask = newPendingTask
    },
    addNextTask(task: ListrTask | ListrTask[]) {
      taskList.add(task)
      const newPendingTask = createIntermediateTask()
      taskList.add(newPendingTask.task)
      currentPendingTask.resolve()
      currentPendingTask = newPendingTask
    },
  }
}

export async function handleWatcherEvents({
  sourcePath,
  eventName,
  pendingTaskList,
  task,
  context,
  pendingUpdateLog,
}: {
  sourcePath: string
  eventName: string
  pendingTaskList: ReturnType<typeof createPendingTaskList>
  task: ListrTaskWrapper<Context, ListrDefaultRenderer>
  context: PickContext<
    | 'bidirectionalSync'
    | 'dependentPackageName'
    | 'intermediateCacheDirectory'
    | 'isExiting'
    | 'noSymlink'
    | 'sourcePackagePath'
    | 'targetPackagePath'
  >
  pendingUpdateLog: string[]
}): Promise<void> {
  try {
    const targetPath = getOppositePath(
      sourcePath,
      context.sourcePackagePath,
      context.dependentPackageName,
      context.targetPackagePath,
    )

    switch (eventName) {
      case 'add':
      case 'change': {
        if (context.bidirectionalSync) {
          pendingUpdateLog.push(targetPath)

          debugConsole.log('Pending update added', targetPath)
        }

        await copyFile(sourcePath, targetPath)

        if (
          path.join(context.sourcePackagePath, 'package.json') === sourcePath
        ) {
          pendingTaskList.addNextTask([
            installDependentPackageTask(
              context,
              'Detected changes in source package.json. Reinstalling the package to pick up possible (peer)dependency changes.',
            ),
            symlinkTask(context),
          ])
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

        if (context.bidirectionalSync) {
          debugConsole.log('Pending update added', targetPath)
          pendingUpdateLog.push(targetPath)
        }

        break
      }

      default: {
        throw new Error(`Unknown event ${eventName}`)
      }
    }
  } catch (error) {
    const knownError = toErrorWithMessage(error)
    notifier.notify({
      title: 'linkandtink',
      message: knownError.message,
    })
    pendingTaskList.rejectCurrentTask(error)
  }
}

export function isPathInPackList(
  sourcePath: string,
  sourcePackagePath: string,
  packList: Context['syncPaths'],
): boolean {
  const relativePath = path.relative(sourcePackagePath, sourcePath)
  return packList.includes(relativePath)
}
