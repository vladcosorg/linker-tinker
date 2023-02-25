import { expect, test } from 'vitest'

import { createSubcontext } from '../../src/lib/context'

test('Created contexts provide access to declared vars and forbid access to undeclared ones ', () => {
  const context = {
    one: true,
    two: false,
    three: 3,
  }

  const subcontext = createSubcontext(['one', 'three'], context as any)

  expect(subcontext.one).toBe(true)
  // @ts-expect-error Access undefined property for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  expect(() => subcontext.two).toThrowError()
})
