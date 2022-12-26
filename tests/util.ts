import { clearTimeout, clearInterval } from 'node:timers'

import isEqual from 'lodash/isEqual'
import { expect, SpyInstance } from 'vitest'

interface Options {
  checkInterval?: number
  bailTimeout?: number
}
export async function waitUntilTrue(
  expression: () => boolean,
  { checkInterval = 500, bailTimeout = 2000 }: Options = {},
): Promise<true> {
  return new Promise((resolve, reject) => {
    const tooLongInterval = setTimeout(() => {
      reject(new Error('too long'))
    }, bailTimeout)

    const cancelCheck = setInterval(() => {
      if (expression()) {
        clearInterval(cancelCheck)
        clearTimeout(tooLongInterval)
        resolve(true)
      }
    }, checkInterval)
  })
}

export async function waitUntiltoHaveBeenCalledWith(
  spy: SpyInstance,
  expectedCallArguments: unknown[],
  options?: Options,
): Promise<void> {
  try {
    await waitUntilTrue(
      () =>
        spy.mock.calls.some((callArgument) =>
          isEqual(callArgument, expectedCallArguments),
        ),
      options,
    )
  } catch {
    console.log(spy)
  } finally {
    expect(spy).toHaveBeenCalledWith(...expectedCallArguments)
  }
}
