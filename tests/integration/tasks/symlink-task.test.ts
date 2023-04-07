import jetpack from 'fs-jetpack'
import { Listr } from 'listr2'
import { expect, test } from 'vitest'

import type { Context } from '@/lib/context'

import { assembleInstalledPath } from '../../../src/lib/misc'
import { symlinkTask } from '../../../src/lib/tasks/sync/create-symlink'
import { getFsHelpers } from '../../unit/helpers'

const { createPackage } = getFsHelpers()
test('A symlink is created in place of the installed package', async () => {
  const dependencyPackage = createPackage({
    files: {
      'package.json': {
        name: 'secondary',
        dependencies: {
          'is-sorted': '<1.0.1',
        },
      },
    },
  })

  const rootPackage = createPackage({
    files: {
      'package.json': {
        name: 'master',
      },
    },
  })

  const context = {
    targetPackagePath: rootPackage.cwd.path(),
    dependentPackageName: dependencyPackage.packageName,
    noSymlink: false,
    intermediateCacheDirectory: dependencyPackage.cwd.path(),
  } satisfies Partial<Context>

  const installedPath = assembleInstalledPath(
    rootPackage.cwd.path(),
    dependencyPackage.packageName,
  )

  await jetpack.copyAsync(dependencyPackage.cwd.path(), installedPath)

  await new Listr([symlinkTask(context)]).run()

  expect(
    jetpack.inspect(
      assembleInstalledPath(
        rootPackage.cwd.path(),
        dependencyPackage.packageName,
      ),
    )?.type,
  ).toBe('symlink')
})
