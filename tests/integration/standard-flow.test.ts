import { read } from 'fs-jetpack'
import { it, vi, expect } from 'vitest'
import { mockProcessExit } from 'vitest-mock-process'

import Link from '../../src/commands/link'
import { runNpmInstallRoot } from '../../src/lib/run'
import { getFsHelpers } from '../unit/helpers'
import { expectUntil, waitUntiltoHaveBeenCalledWith } from '../util'

const spy = vi.spyOn(console, 'log')
const { createPackage } = getFsHelpers()
const mockExit = mockProcessExit()
it('run full process', async () => {
  const contentFilePath = 'node_modules/secondary/content.js'
  const secondaryDirectoryOriginal = createPackage({
    directoryName: 'secondary-original',
    packageName: 'secondary',
    files: {
      'content.js': '0',
    },
  })

  const secondaryDirectorySynced = createPackage({
    packageName: 'secondary',
    files: {
      'content.js': '1',
    },
  })

  const masterDirectory = createPackage({
    files: {
      'package.json': {
        name: 'master',
        dependencies: {
          secondary: secondaryDirectoryOriginal.cwd.path(),
        },
      },
    },
  })

  await runNpmInstallRoot(masterDirectory.cwd.path())

  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('0')

  void Link.run([
    secondaryDirectorySynced.cwd.path(),
    masterDirectory.cwd.path(),
  ])

  await waitUntiltoHaveBeenCalledWith(spy, [
    '[STARTED] Waiting for changes (press q to exit and restore the original package contents)',
  ])

  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('1')

  secondaryDirectorySynced.cwd.file('content.js', { content: '2' })

  const validValue = '2'
  await expectUntil(
    () => read(masterDirectory.cwd.path(contentFilePath)),
    validValue,
  ).toBe(validValue)

  process.stdin.emit('keypress', undefined, { name: 'ę' })
  await waitUntiltoHaveBeenCalledWith(spy, [
    '[SUCCESS] Restoring original version',
  ])
  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('0')
  expect(mockExit).toHaveBeenCalledWith(0)
}, 10_000)
