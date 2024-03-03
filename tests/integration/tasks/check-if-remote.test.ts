import { Listr } from 'listr2'
import { expect, test, vi } from 'vitest'

import { cloneRepo, runNpmInstallRoot } from '../../../src/lib/executor'
import { checkIfRemote } from '../../../src/lib/tasks/sync/check-if-remote'
import { activateProcessMock, recursiveJson } from '../../snaphot-util'
import { getFsHelpers } from '../../unit/helpers'

import type { ProcessMockTestContext } from '../../snaphot-util'

const { temporaryCwd } = getFsHelpers()
activateProcessMock()
vi.mock('../../../src/lib/executor', async () => {
  const actual = await vi.importActual('../../../src/lib/executor')
  return {
    ...actual,
    cloneRepo: vi.fn(() => vi.fn()),
    runNpmInstallRoot: vi.fn(() => vi.fn()),
  }
})

async function runTask(...parameters: Parameters<typeof checkIfRemote>) {
  return new Listr([checkIfRemote(...parameters)], { renderer: 'test' }).run()
}

vi.mock('node:os', () => ({
  homedir() {
    return temporaryCwd.path()
  },
}))

test<ProcessMockTestContext>('should clone the remote repo and install it', async ({
  stderr,
  stdout,
}) => {
  await runTask({ sourcePackagePath: 'chalk' })
  expect(vi.mocked(cloneRepo)).toHaveBeenCalledWith(
    'git@github.com:chalk/chalk.git',
    temporaryCwd.path('linker-tinker/chalk'),
  )
  expect(vi.mocked(runNpmInstallRoot)).toHaveBeenCalledWith(
    temporaryCwd.path('linker-tinker/chalk'),
  )

  expect(recursiveJson(stdout.mock.calls)).toMatchSnapshot()
  expect(recursiveJson(stderr.mock.calls)).toMatchSnapshot()
})

test<ProcessMockTestContext>('should reuse an existing repo if it was already cloned and then install it', async ({
  stderr,
  stdout,
}) => {
  await runTask({ sourcePackagePath: 'chalk' })
  temporaryCwd.dir('linker-tinker/chalk')
  await runTask({ sourcePackagePath: 'chalk' })

  expect(vi.mocked(cloneRepo)).toHaveBeenCalledOnce()
  expect(vi.mocked(runNpmInstallRoot)).toHaveBeenCalledTimes(2)

  expect(recursiveJson(stdout.mock.calls)).toMatchSnapshot()
  expect(recursiveJson(stderr.mock.calls)).toMatchSnapshot()
})

test<ProcessMockTestContext>('should skip if the provided package name is a path', async ({
  stderr,
  stdout,
}) => {
  await runTask({ sourcePackagePath: '/path/to/repo' })
  expect(vi.mocked(cloneRepo)).toHaveBeenCalledTimes(0)
  expect(vi.mocked(runNpmInstallRoot)).toHaveBeenCalledTimes(0)

  expect(recursiveJson(stdout.mock.calls)).toMatchSnapshot()
  expect(recursiveJson(stderr.mock.calls)).toMatchSnapshot()
})

test('should throw error if an invalid package is specified', async () => {
  await expect(async () =>
    runTask({ sourcePackagePath: 'foo-bar-vladcos' }),
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('should throw error if a package without information about repository is specified', async () => {
  await expect(async () =>
    runTask({ sourcePackagePath: '@vladcos/prettier-config' }),
  ).rejects.toThrowErrorMatchingSnapshot()
})
