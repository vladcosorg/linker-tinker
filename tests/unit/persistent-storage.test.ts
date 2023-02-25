import { beforeEach, describe, expect, it } from 'vitest'

import { getFsHelpers } from './helpers'

import {
  attachActiveRun,
  createOrGetPersistentStorage,
  getActiveRunsForPackage,
} from '../../src/lib/persistent-storage'

const { createPackage, temporaryCwd } = getFsHelpers()

beforeEach(() => {
  const storage = createOrGetPersistentStorage(temporaryCwd.path())

  return () => {
    storage.clear()
  }
})

describe('Attaching new active run', () => {
  it('Ensure that leftover references are not saved as previous configuration', async () => {
    const dependentPackageName = 'test'
    const testPackage = createPackage({
      files: {
        'package.json': {
          name: 'master',
          dependencies: {
            [dependentPackageName]:
              'file:../../../Library/Caches/linker-tinker/chetzof-lint-config',
          },
        },
      },
    })

    await attachActiveRun({
      dependentPackageName,
      targetPackagePath: testPackage.cwd.path(),
    })

    expect(
      getActiveRunsForPackage(dependentPackageName)?.[testPackage.cwd.path()],
    ).toBe(null)
  })
  it('Ensure that proper references are saved as previous configuration', async () => {
    const dependentPackageName = 'test'
    const testPackage = createPackage({
      files: {
        'package.json': {
          name: 'master',
          dependencies: {
            [dependentPackageName]: '1.0.0',
          },
        },
      },
    })

    await attachActiveRun({
      dependentPackageName,
      targetPackagePath: testPackage.cwd.path(),
    })

    expect(
      getActiveRunsForPackage(dependentPackageName)?.[testPackage.cwd.path()],
    ).toEqual({
      versionRange: '1.0.0',
      dependencyType: 'dependencies',
    })
  })
})
