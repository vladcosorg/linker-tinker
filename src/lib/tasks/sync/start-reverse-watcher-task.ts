import { watch } from 'chokidar'

import { eventBus } from '@/lib/event-emitter'
import { getInstalledDependencyPath } from '@/lib/misc'
import type { ContextualTaskWithRequired } from '@/lib/tasks'
import {
  createPendingTaskList,
  handleWatcherEvents,
  isRecursionEvent,
} from '@/lib/watcher'

export function startReverseWatcherTask(): ContextualTaskWithRequired<
  | 'bidirectionalSync'
  | 'pendingBidirectionalUpdates'
  | 'sourcePackagePath'
  | 'targetPackagePath'
> {
  return {
    enabled(context) {
      return context.bidirectionalSync
    },
    options: {
      bottomBar: 5,
    },
    title: 'Starting reverse-direction watcher [EXPERIMENTAL]',
    task: async (context, task) => {
      const pendingTaskList = createPendingTaskList()

      const watcher = watch(
        await getInstalledDependencyPath(
          context.targetPackagePath,
          context.sourcePackagePath,
        ),
        {
          ignoreInitial: true,
          persistent: true,
          ignored: ['**/.git/**'],
        },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
      ).on('all', async (eventName, sourcePath) => {
        if (
          isRecursionEvent(
            sourcePath,
            context.pendingBidirectionalUpdates.fromSource,
            context,
          )
        ) {
          return
        }

        await handleWatcherEvents({
          sourcePath,
          eventName,
          pendingTaskList,
          task,
          context,
          pendingUpdateLog: context.pendingBidirectionalUpdates.toSource,
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
