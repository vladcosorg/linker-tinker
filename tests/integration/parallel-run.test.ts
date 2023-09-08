import { execa } from 'execa'
import fs from 'fs-jetpack'
import { expect, it } from 'vitest'

import { runNpmInstallRoot } from '../../src/lib/executor'
import { getFsHelpers } from '../unit/helpers'
import { expectUntil } from '../util'

const { createPackage } = getFsHelpers()
it('Runnin two syncs should not mess with each other', async () => {
  const firstDepPackage = createPackage({
    packageName: 'first',
  })

  const secondDepPackage = createPackage({
    packageName: 'second',
  })

  const masterDirectory = createPackage()

  await runNpmInstallRoot(masterDirectory.cwd.path())

  const firstChild = execa('./bin/dev', [
    'sync',
    firstDepPackage.cwd.path(),
    masterDirectory.cwd.path(),
  ])

  await expectUntil(
    () =>
      fs.exists(
        masterDirectory.cwd.path(
          'node_modules',
          firstDepPackage.packageName,
          // eslint-disable-next-line sonarjs/no-duplicate-string
          'package.json',
        ),
      ),
    'file',
  ).resolves.toBe('file')

  const secondChild = execa('./bin/dev', [
    'sync',
    secondDepPackage.cwd.path(),
    masterDirectory.cwd.path(),
  ])

  await expectUntil(
    () =>
      fs.exists(
        masterDirectory.cwd.path(
          'node_modules',
          secondDepPackage.packageName,
          'package.json',
        ),
      ),
    'file',
  ).resolves.toBe('file')

  expect(
    fs.exists(
      masterDirectory.cwd.path(
        'node_modules',
        firstDepPackage.packageName,
        'package.json',
      ),
    ),
  ).toBe('file')

  firstChild.cancel()
  secondChild.cancel()
})
