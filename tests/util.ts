import { clearTimeout, clearInterval } from 'node:timers'

import isEqual from 'lodash/isEqual'
import { expect } from 'vitest'

import type { SpyInstance } from 'vitest'

interface Options {
  checkInterval?: number
  bailTimeout?: number
}

async function waitUntilEqual<T>(
  checkExpression: () => T,
  expectedExpressionResult: T,
  { checkInterval = 500, bailTimeout = 5000 }: Options = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    let lastResult: unknown
    const tooLongInterval = setTimeout(() => {
      reject(lastResult)
    }, bailTimeout)

    const cancelCheck = setInterval(() => {
      lastResult = checkExpression()
      if (lastResult === expectedExpressionResult) {
        clearInterval(cancelCheck)
        clearTimeout(tooLongInterval)
        resolve(expectedExpressionResult)
      }
    }, checkInterval)
  })
}

export async function waitUntilTrue<T>(
  expression: () => T,
  { checkInterval = 500, bailTimeout = 5000 }: Options = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tooLongInterval = setTimeout(() => {
      reject(new Error('too long'))
    }, bailTimeout)

    const cancelCheck = setInterval(() => {
      const result = expression()
      if (result) {
        clearInterval(cancelCheck)
        clearTimeout(tooLongInterval)
        resolve(result)
      }
    }, checkInterval)
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function expectUntil<T>(expression: () => T, expectedValue: T) {
  return expect(waitUntilEqual(expression, expectedValue)).resolves
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
    expect(spy).toHaveBeenCalledWith(...expectedCallArguments)
  } finally {
    expect(spy).toHaveBeenCalledWith(...expectedCallArguments)
  }
}

export const delay = async (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t))
