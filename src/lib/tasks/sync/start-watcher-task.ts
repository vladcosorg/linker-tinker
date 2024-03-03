import { watch } from 'chokidar'
import _ from 'lodash'

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
    task: (context_, task) => {
      const pendingTaskList = createPendingTaskList()
      let needsPacklistRefresh = false
      let scheduledChanges: Record<string, string> = {}
      const throttled = _.throttle(async () => {
        if (needsPacklistRefresh && !context.watchAll) {
          context.syncPaths = await getPackList(context.sourcePackagePath)
        }

        const currentBatch = scheduledChanges
        scheduledChanges = {}
        needsPacklistRefresh = false
        console.log('batch created', Object.entries(currentBatch).length)

        for (const [sourcePath, eventName] of Object.entries(currentBatch)) {
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

          if (
            !context.watchAll &&
            !isPathInPackList(
              sourcePath,
              context.sourcePackagePath,
              context.syncPaths,
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
            pendingUpdateLog: context.pendingBidirectionalUpdates.fromSource,
          })
        }
      }, 1000)

      const watcher = watch(context.sourcePackagePath, {
        ignoreInitial: true,
        persistent: true,
        ignored: ['**/.git/**', '**/node_modules/**'],
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
      }).on('all', async (eventName, sourcePath) => {
        scheduledChanges[sourcePath] = eventName
        if (eventName === 'add') {
          needsPacklistRefresh = true
        }
        await throttled()
      })

      eventBus.on('exit', async () => {
        await watcher.close()
        pendingTaskList.exit()
      })

      return pendingTaskList.taskList
    },
  }),
)
