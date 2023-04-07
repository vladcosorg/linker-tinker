import chalk from 'chalk'

import { debugConsole } from '@/lib/debug'
import { deferred } from '@/lib/deferred'
import { eventBus } from '@/lib/event-emitter'
import {
  getActiveRunsForPackage,
  reloadPersistentStorage,
  resetActiveRunsForPackage,
} from '@/lib/persistent-storage'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const watchUnlinksTask = createTask(
  (
    context: PickContext<
      | 'dependentPackageName'
      | 'foregroundWatcher'
      | 'isExiting'
      | 'targetPackagePath'
    >,
  ) => ({
    options: {
      bottomBar: 5,
    },
    enabled() {
      return !context.isExiting && !context.foregroundWatcher
    },
    title: 'Watching configuration changes',
    async task() {
      const def = deferred()
      debugConsole.log('Starting watching configuration changes')
      debugConsole.log(
        'Current subscribers',
        getActiveRunsForPackage(context.dependentPackageName),
      )

      const cancelCheck = setInterval(() => {
        reloadPersistentStorage()
        const activeRuns = getActiveRunsForPackage(context.dependentPackageName)
        if (!activeRuns || Object.keys(activeRuns).length === 0) {
          debugConsole.log(
            `Exiting watcher for ${chalk.bold(
              context.dependentPackageName,
            )} because there are no subscribers`,
          )
          resetActiveRunsForPackage(context.dependentPackageName)
          eventBus.emit('exit')
        }
      }, 1000)

      eventBus.on('exit', () => {
        clearInterval(cancelCheck)
        def.resolve(true)
      })

      return def.promise
    },
  }),
)
