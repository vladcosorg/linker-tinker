import chalk from 'chalk'
import execa from 'execa'
import { debug } from 'oclif/lib/log'

import { terminate } from '@/lib/child-process'
import { PrematureExitError } from '@/lib/error'
import { eventBus } from '@/lib/event-emitter'
import type { Task } from '@/lib/sync/tasks'

export function maybeRunDependencyWatcherTask(): Task {
  return {
    enabled(context) {
      return context.runWatcherScript !== undefined
    },
    title: 'Running dependency command',
    task: async (context, task): Promise<void> => {
      if (!context.runWatcherScript) {
        return
      }

      const command = chalk.grey(
        `[npm run ${context.runWatcherScript} in dir ${context.sourcePackagePath}]`,
      )
      let killed = false
      task.title += ` ${command} `

      const child = execa('npm', ['run', context.runWatcherScript], {
        cwd: context.sourcePackagePath,
        shell: true,
      })

      if (debug) {
        console.warn('Watcher PID', child.pid)
      }

      if (!child.stdout) {
        throw new Error('Something went wrong')
      }

      child.stdout.pipe(task.stdout())

      eventBus.once('exit', async () => {
        killed = true
        if (child.pid) {
          await terminate(child.pid, context.debug)
          child.cancel()
        } else if (debug) {
          console.warn('Child PID was not available for some reason')
        }
      })

      try {
        await child
        throw new PrematureExitError()
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (killed) {
          return
        }

        throw error
      }
    },
  }
}
