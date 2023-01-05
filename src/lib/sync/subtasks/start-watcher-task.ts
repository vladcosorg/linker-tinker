import { watch } from 'chokidar'

import { eventBus } from '@/lib/event-emitter'
import { getPackList } from '@/lib/packlist'
import type { Context } from '@/lib/sync/tasks'
import {
  createPendingTaskList,
  handleWatcherEvents,
  isPathInPackList,
  isRecursionEvent,
} from '@/lib/watcher'

import type { ListrTask } from 'listr2'

export function startWatcherTask(): ListrTask<Context> {
  return {
    options: {
      bottomBar: 5,
    },
    title: 'Starting watching the files',
    task: (context, task) => {
      const pendingTaskList = createPendingTaskList()

      const watcher = watch(context.sourcePackagePath, {
        ignoreInitial: true,
        persistent: true,
        ignored: ['**/.git/**', '**/node_modules/**'],
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
      }).on('all', async (eventName, sourcePath) => {
        if (
          context.bidirectionalSync &&
          isRecursionEvent(
            sourcePath,
            context.pendingBidirectionalUpdates.toSource,
            context,
          )
        ) {
          return
        }

        if (!context.watchAll) {
          if (eventName === 'add') {
            context.syncPaths = await getPackList(context.sourcePackagePath)
          }

          if (
            !isPathInPackList(
              sourcePath,
              context.sourcePackagePath,
              context.syncPaths,
            )
          ) {
            return
          }
        }

        await handleWatcherEvents({
          sourcePath,
          eventName,
          pendingTaskList,
          task,
          context,
          pendingUpdateLog: context.pendingBidirectionalUpdates.fromSource,
        })
      })

      eventBus.on('exit', async () => {
        await watcher.close()
        pendingTaskList.exit()
      })

      return pendingTaskList.taskList
    },
  }
}
