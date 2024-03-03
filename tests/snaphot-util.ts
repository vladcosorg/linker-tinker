import { afterEach, beforeEach } from 'vitest'
import { mockProcessStderr, mockProcessStdout } from 'vitest-mock-process'

export interface ProcessMockTestContext {
  stdout: ReturnType<typeof mockProcessStdout>
  stderr: ReturnType<typeof mockProcessStderr>
}
export function recursiveJson(input: any) {
  if (Array.isArray(input)) {
    return input.map((value) => recursiveJson(value))
  }

  if (typeof input === 'string') {
    return JSON.parse(input)
  }

  return input
}
export function activateProcessMock() {
  beforeEach<ProcessMockTestContext>((context) => {
    context.stdout = mockProcessStdout()
    context.stderr = mockProcessStderr()
  })

  afterEach<ProcessMockTestContext>(({ stdout, stderr }) => {
    stdout.mockRestore()
    stderr.mockRestore()
  })
}
