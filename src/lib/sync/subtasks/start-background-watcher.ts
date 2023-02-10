import { isWatcherRunningForPackage, launchBackgroundWatcher } from '@/lib/pm2'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function startBackgroundWatcher(): ContextualTaskWithRequired<'dependentPackageName'> {
  return {
    enabled: async (context) => {
      const isWatcherAlreadyRunning = await isWatcherRunningForPackage(
        context.dependentPackageName,
      )
      return !isWatcherAlreadyRunning
    },
    title: 'Starting background watcher',
    task: async (context) =>
      launchBackgroundWatcher(context.dependentPackageName),
  }
}
