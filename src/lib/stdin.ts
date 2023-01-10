import process from 'node:process'
import readline from 'node:readline'

import { eventBus } from '@/lib/event-emitter'

type EventHandler = (
  string: string,
  key?: { name: string; ctrl?: boolean },
) => void

let exiting = false

function handleKeywordInterrupt(debug: boolean) {
  if (debug) {
    console.info('Main process PID', process.pid)
  }

  if (debug) {
    console.info('Event bus: Sent "exit" event')
  }

  if (!exiting) {
    eventBus.emit('exit')
    eventBus.emit('exitImmediatelyIntent')
    exiting = true
    return
  }

  if (debug) {
    console.info('Event bus: Sent "exitImmediately" event')
  }

  eventBus.emit('exitImmediately')
}

function createKeypressHandler(debug: boolean): EventHandler {
  return (_string, key?) => {
    if (!key) {
      return
    }

    if (key.ctrl && key.name === 'c') {
      handleKeywordInterrupt(debug)
    }

    if ((key.name === 'q' || key.name === 'ę') && !exiting) {
      exiting = true
      eventBus.emit('exit')
      if (debug) {
        console.info('Event bus: Sent "exit" event')
      }
    }
  }
}

export function prepareStdin(debug = false): void {
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  process.stdin.once('keypress', createKeypressHandler(debug))
}
