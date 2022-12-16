import process from 'node:process'
import readline from 'node:readline'

export function listenToQuitKey(callback: () => void): void {
  function handler(_string: string, key?: { name: string; ctrl?: boolean }) {
    if (!key) {
      return
    }

    if (key.name === 'q') {
      process.stdin.removeListener('keypress', handler)
      callback()
    }

    if (key.ctrl && key.name === 'c') {
      // eslint-disable-next-line unicorn/no-process-exit,no-process-exit
      process.exit(1)
    }
  }

  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  process.stdin.on('keypress', handler)
}
