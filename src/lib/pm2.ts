import path from 'node:path'
import process from 'node:process'

import pm2 from 'pm2'

import { debugConsole } from '@/lib/debug'

import type { ProcessDescription, StartOptions } from 'pm2'

async function getRunningWatchers(): Promise<ProcessDescription[]> {
  return new Promise((resolve, reject) => {
    pm2.connect((error) => {
      if (error) {
        reject(error)
      }

      pm2.list((error, list) => {
        if (error) {
          reject(error)
        }

        resolve(
          list.filter(
            (process) => process.pm2_env?.namespace === 'linker-tinker',
          ),
        )

        pm2.disconnect()
      })
    })
  })
}

export async function isWatcherRunningForPackage(
  packageName: string,
): Promise<boolean> {
  const runningWatchers = await getRunningWatchers()
  return runningWatchers.some(
    (app) => app.name === packageName && app.pm2_env?.status === 'online',
  )
}

export async function launchBackgroundWatcher(
  packageName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.connect((error) => {
      if (error) {
        reject(error)
      }

      const options: StartOptions = {
        script: process.argv[1],
        name: packageName,
        namespace: 'linker-tinker',
        args: ['watch', ...process.argv.slice(3)],
        output: path.resolve('./log.log'),
        // env: { pm_out_log_path: './log.log' },
        interpreter_args: [],
        autorestart: false,
      }
      debugConsole.info('Background process start options', options)
      pm2.start(options, (error) => {
        if (error) {
          reject(error)
        }

        resolve()
        pm2.disconnect()
      })
    })
  })
}
