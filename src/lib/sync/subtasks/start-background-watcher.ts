import { isWatcherRunningForPackage, launchBackgroundWatcher } from '@/lib/pm2'
import type { Task } from '@/lib/sync/tasks'

export function startBackgroundWatcher(): Task {
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
