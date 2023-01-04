import { read } from 'fs-jetpack'
import { it, vi, expect } from 'vitest'
import { mockProcessExit } from 'vitest-mock-process'

import Sync from '../../src/commands/sync'
import { runNpmReinstall } from '../../src/lib/run'
import { getFsHelpers } from '../unit/helpers'
import { waitUntiltoHaveBeenCalledWith } from '../util'

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

  await runNpmReinstall(masterDirectory.cwd.path())

  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('0')

  void Sync.run([
    secondaryDirectorySynced.cwd.path(),
    masterDirectory.cwd.path(),
  ])

  await waitUntiltoHaveBeenCalledWith(spy, [
    '[STARTED] Waiting for changes (press q to exit and restore the original package contents)',
  ])

  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('1')

  secondaryDirectorySynced.cwd.file('content.js', { content: '2' })

  await waitUntiltoHaveBeenCalledWith(spy, [
    '[SUCCESS] Copied from ./secondary/content.js to ./master/node_modules/secondary/content.js',
  ])

  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('2')

  process.stdin.emit('keypress', undefined, { name: 'ę' })
  await waitUntiltoHaveBeenCalledWith(spy, [
    '[SUCCESS] Reverting to the previous package version',
  ])
  expect(read(masterDirectory.cwd.path(contentFilePath))).toBe('0')
  expect(mockExit).toHaveBeenCalledWith(0)
}, 10_000)
