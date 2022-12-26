import { describe, expect, test, vi } from 'vitest'

import { waitUntiltoHaveBeenCalledWith, waitUntilTrue } from '../util'

describe('waitUntilTrue', () => {
  test('sucessfuly check immediately', async () => {
    const marker = true
    await expect(waitUntilTrue(() => marker)).resolves.toBe(true)
  })

  test('sucessfuly wait over check interval ', async () => {
    let marker = false

    setTimeout(() => {
      marker = true
    }, 10)
    await expect(
      waitUntilTrue(() => marker, { checkInterval: 5 }),
    ).resolves.toBe(true)
  })

  test('trigger timeout protection', async () => {
    let marker = false

    setTimeout(() => {
      marker = false
    }, 10)
    await expect(
      waitUntilTrue(() => marker, { bailTimeout: 5 }),
    ).rejects.toThrow()
  })
})

describe('waitUntiltoHaveBeenCalledWith', () => {
  test('successful waitUntiltoHaveBeenCalledWith', async () => {
    const testFunction = {
      run: (foo: string, bar: string) => `${foo}${bar}}`,
    }
    const spy = vi.spyOn(testFunction, 'run')
    setTimeout(() => {
      testFunction.run('one', 'two')
    }, 5)
    await waitUntiltoHaveBeenCalledWith(spy, ['one', 'two'], {
      bailTimeout: 10,
    })
  })

  test('unsuccessful waitUntiltoHaveBeenCalledWith', async () => {
    const testFunction = {
      run: (foo: string, bar: string) => `${foo}${bar}}`,
    }
    const spy = vi.spyOn(testFunction, 'run')
    setTimeout(() => {
      testFunction.run('one', 'two')
    }, 10)
    await expect(
      waitUntiltoHaveBeenCalledWith(spy, ['one', 'two'], { bailTimeout: 5 }),
    ).rejects.toThrow()
  })
})
