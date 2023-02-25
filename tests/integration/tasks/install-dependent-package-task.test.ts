import { Listr } from 'listr2'
import { expect, it } from 'vitest'

import { installDependentPackageTask } from '../../../src/lib/tasks/sync/install-dependent-package-task'
import { getFsHelpers, readPackageJson } from '../../unit/helpers'

const { createPackage, temporaryCwd } = getFsHelpers()
it('should update the dependent package transitive dependency when already installed', async () => {
  createPackage({
    files: {
      'package.json': {
        name: 'secondary',
        dependencies: {
          'is-sorted': '<1.0.1',
        },
      },
    },
  })

  const primaryPackage = createPackage({
    files: {
      'package.json': {
        name: 'master',
      },
    },
  })

  const listr = new Listr(installDependentPackageTask(), {
    ctx: {
      dependentPackageName: 'secondary',
      targetPackagePath: primaryPackage.cwd.path(),
      isExiting: false,
      intermediateCacheDirectory: temporaryCwd.path(),
    },
  })

  await listr.run()

  let packageJson = readPackageJson(
    primaryPackage.cwd.path('node_modules/is-sorted'),
  )
  expect(packageJson['version']).toBe('1.0.0')

  createPackage({
    files: {
      'package.json': {
        name: 'secondary',
        dependencies: {
          'is-sorted': '^1.0.5',
        },
      },
    },
  })

  await listr.run()

  packageJson = readPackageJson(
    primaryPackage.cwd.path('node_modules/is-sorted'),
  )
  expect(packageJson['version']).toBe('1.0.5')
})
