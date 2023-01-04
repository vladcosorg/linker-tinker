import process from 'node:process'

import pidtree from 'pidtree'

export async function terminate(
  parentPid: number,
  debug = false,
): Promise<void> {
  const pids = await pidtree(parentPid)

  if (debug) {
    console.warn('pidtree', pids)
  }

  for (const pid of pids) {
    if (debug) {
      console.warn(`Killing ${pid}`)
    }

    process.kill(pid)
  }
}
