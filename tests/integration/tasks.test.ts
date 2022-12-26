import { read } from 'fs-jetpack'
import { isEqual } from 'lodash'
import { it, vi, afterEach } from 'vitest'

const spy = vi.spyOn(console, 'log')
import Sync from '../../src/commands/sync'
import { execNpm } from '../../src/lib/child-process'
import { getTestTemporaryDirectory } from '../unit/helpers'
import { waitUntiltoHaveBeenCalledWith, waitUntilTrue } from '../util'

import type { FSJetpack } from 'fs-jetpack/types'

const testTemporaryDirectory = getTestTemporaryDirectory()
afterEach(() => {
  testTemporaryDirectory.dir(testTemporaryDirectory.path(), { empty: true })
})

const packageOriginalContent = {
  name: 'secondary',
  version: '1.0.0',
}

const packageSyncContent = {
  name: 'secondary',
  version: '1.1.0',
}

function addPackageContent<T extends FSJetpack>(
  path: T,
  content: object | string,
): T {
  return path.file('package.json', {
    content,
  }) as T
}

function addFileContent<T extends FSJetpack>(
  path: T,
  content: object | string,
): T {
  return path.file('content.js', {
    content,
  }) as T
}

it('run full process', async () => {
  const secondaryDirectoryOriginal =
    testTemporaryDirectory.cwd('secondary-original')

  addPackageContent(secondaryDirectoryOriginal, packageOriginalContent)
  addFileContent(secondaryDirectoryOriginal, '0')

  const secondaryDirectorySynced = testTemporaryDirectory.cwd('secondary')

  addPackageContent(secondaryDirectorySynced, packageSyncContent)
  addFileContent(secondaryDirectorySynced, '1')

  const primaryDirectory = testTemporaryDirectory.cwd('primary')

  addPackageContent(primaryDirectory, {
    name: 'primary',
    version: '1.0.0',
    dependencies: {
      secondary: secondaryDirectoryOriginal.path(),
    },
  })

  await execNpm('install', { cwd: primaryDirectory.path() })
  await waitUntilTrue(() =>
    isEqual(
      read(
        primaryDirectory.path('node_modules/secondary/package.json'),
        'json',
      ),
      packageOriginalContent,
    ),
  )
  // eslint-disable-next-line no-void
  void Sync.run([secondaryDirectorySynced.path(), primaryDirectory.path()])

  await waitUntiltoHaveBeenCalledWith(spy, [
    '[STARTED] Waiting for changes (press q to exit and restore the original package contents)',
  ])

  await waitUntilTrue(() =>
    isEqual(
      read(
        primaryDirectory.path('node_modules/secondary/package.json'),
        'json',
      ),
      packageSyncContent,
    ),
  )

  secondaryDirectorySynced.file('content.js', { content: '2' })

  await waitUntiltoHaveBeenCalledWith(spy, [
    '[SUCCESS] Copied from ./secondary/content.js to ./primary/node_modules/secondary/content.js',
  ])
}, 10_000)
