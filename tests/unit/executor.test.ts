import * as util from 'node:util'

import { beforeAll, describe, expect, test } from 'vitest'

import { eventBus } from '../../src/lib/event-emitter'
import { abortableExeca, cancellableExeca } from '../../src/lib/executor'

describe('Event listener memory leak prevention', () => {
  beforeAll(() => {
    eventBus.removeAllListeners()
  })

  test('Ensure that processes are cancellable', async () => {
    const promise = cancellableExeca('sleep', ['10'], { reject: false })
    eventBus.emit('exitImmediately')
    const child = await promise
    expect(child.isCanceled).toBe(true)
  })

  test('Ensure that the event listeners are removed after successfull execution', async () => {
    const promise = cancellableExeca('date')
    expect(eventBus.listenerCount('exitImmediately')).toBe(1)
    await promise
    expect(eventBus.listenerCount('exitImmediately')).toBe(0)
  })

  test('Ensure that the event listeners are removed after unsuccesful execution', async () => {
    const promise = cancellableExeca('non-existent-command')
    expect(eventBus.listenerCount('exitImmediately')).toBe(1)
    await expect(promise).rejects.toThrow()
    expect(eventBus.listenerCount('exitImmediately')).toBe(0)
  })
})

test('Cancel identical similar running process if a new one is started', async () => {
  // try {
  const id = 'unique-id'
  const firstCall = abortableExeca(id, 'sleep', ['1'])
  // console.log(firstCall)
  const secondCall = abortableExeca(id, 'sleep', ['1'])
  // console.log(util.inspect(secondChild, { depth: 0, colors: true }))
  const thirdCall = abortableExeca(id, 'sleep', ['1'])
  const firstChild = await firstCall
  // console.log('aaa', firstChild)
  const secondChild = await secondCall
  const thirdChild = await thirdCall
  // expect(firstChild.isCanceled).toBe(true)
  console.log(util.inspect(firstChild, { depth: 0, colors: true }))
  console.log(util.inspect(secondChild, { depth: 0, colors: true }))
  console.log(util.inspect(thirdChild, { depth: 0, colors: true }))
  // console.log(util.inspect(thirdChild, { depth: 0, colors: true }))
  // console.log(util.inspect(thirdChild, { depth: 0, colors: true }))
  expect(secondChild.isCanceled).toBe(true)
  expect(thirdChild.isCanceled).toBe(false)
  // console.log(secondChild)
  // console.log(thirdChild)
  // } catch {}
})

test('must thrown an error for a non-cancellation failure', () => {
  void expect(() => abortableExeca('ddd', 'foo', ['1'])).rejects.toThrow()
})
