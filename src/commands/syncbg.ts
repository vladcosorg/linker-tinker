import process from 'node:process'

import { Command } from '@oclif/core'
import pm2 from 'pm2'

export default class Syncbg extends Command {
  async run(): Promise<void> {
    pm2.connect((error) => {
      if (error) {
        console.error(error)
        process.exit(2)
      }

      pm2.start(
        {
          script: './bin/dev',
          name: 'api',
          args: ['sync', '../lint-config', '-v'],
          // output: path.resolve('./log.log'),
          // env: { pm_out_log_path: './log.log' },
          // interpreter_args: ['--log .'],
        },
        (error, apps) => {
          console.log('aaaa')
          if (error) {
            console.error(error)
            pm2.disconnect()
            return
          }

          pm2.list((error, list) => {
            console.log(error, list)

            pm2.restart('api', (error, proc) => {
              // Disconnects from PM2
              pm2.disconnect()
            })
          })
        },
      )
    })
  }
}
