import { watch } from 'chokidar'

import { eventBus } from '@/lib/event-emitter'
import { getPackList } from '@/lib/packlist'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'
import {
  createPendingTaskList,
  handleWatcherEvents,
  isPathInPackList,
  isRecursionEvent,
} from '@/lib/watcher'

export const startWatcherTask = createTask(
  (
    context: PickContext<
      | 'bidirectionalSync'
      | 'pendingBidirectionalUpdates'
      | 'sourcePackagePath'
      | 'syncPaths'
      | 'watchAll'
    >,
  ) => ({
    options: {
      bottomBar: 5,
    },
    title: 'Starting watching the files',
    task: (_, task) => {
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
  }),
)
