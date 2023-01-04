import process from 'node:process'
import readline from 'node:readline'

import { eventBus } from '@/lib/event-emitter'

type EventHandler = (
  string: string,
  key?: { name: string; ctrl?: boolean },
) => void

// eslint-disable-next-line sonarjs/cognitive-complexity
export function prepareStdin(debug = false): void {
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  const defaultHandler: EventHandler = (_string, key?) => {
    if (!key) {
      return
    }

    if (key.ctrl && key.name === 'c') {
      if (debug) {
        console.info('Main process PID', process.pid)
      }

      if (debug) {
        console.info('Event bus: Sent "exit" event')
      }

      eventBus.emit('exit')

      if (debug) {
        console.info('Event bus: Sent "exitImmediately" event')
      }

      eventBus.emit('exitImmediately')
    }

    if (key.name === 'q' || key.name === 'ę') {
      if (debug) {
        console.info('Event bus: Sent "exit" event')
      }

      eventBus.emit('exit')
    }
  }

  process.stdin.on('keypress', defaultHandler)
}
