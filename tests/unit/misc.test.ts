import path from 'node:path'

import { expect, it, describe } from 'vitest'

import {
  getPackageName,
  getPackageNiceName,
  getOppositePath,
  getInstalledPackageConfiguration,
  dependencyTypes,
} from '@/lib/misc'
import { getPackList } from '@/lib/packlist'

import { getFsHelpers } from './helpers'

const { createPackage, temporaryCwd } = getFsHelpers()

it('should return a path to a package in node_modules', async () => {
  const { cwd, packageName } = createPackage()
  const relativeDepencencyFilePath = 'dist/file.ts'
  const dependencyFilePath = cwd.path(relativeDepencencyFilePath)

  const primaryRoot = temporaryCwd.cwd('primary')
  const actualResult = getOppositePath(
    dependencyFilePath,
    cwd.path(),
    packageName,
    primaryRoot.path(),
  )
  const expectedResult = primaryRoot.path(
    'node_modules',
    packageName,
    relativeDepencencyFilePath,
  )

  expect(actualResult).toBe(expectedResult)
})

it('should return a pack list', async () => {
  const result = await getPackList(path.resolve('.'))
  expect(result).toBeInstanceOf(Array)
  expect(result).includes('package.json')
})

describe('getPackageName', () => {
  it('should return a name if the name is set in package.json', async () => {
    const { cwd, packageName } = createPackage()

    await expect(getPackageName(cwd.path())).resolves.toBe(packageName)
  })

  it('should throw if the name is not set in package.json', async () => {
    const { cwd } = createPackage({
      files: {
        'package.json': {},
      },
    })

    await expect(getPackageName(cwd.path())).rejects.toThrow(
      'Could not find a package name',
    )
  })

  it('should throw if there is no package.json', async () => {
    await expect(getPackageName(temporaryCwd.path())).rejects.toThrowError(
      'Could not find a package.json',
    )
  })
})

describe('getPackageNiceName', () => {
  it('should return a nice name from package.json', async () => {
    const { cwd, packageName } = createPackage()

    await expect(getPackageNiceName(cwd.path())).resolves.toBe(packageName)
  })
  it('should return the directory name if the name is missing in package.json', async () => {
    const directoryName = 'bar'
    const { cwd } = createPackage({
      directoryName,
      files: {
        'package.json': {},
      },
    })

    await expect(getPackageNiceName(cwd.path())).resolves.toBe(directoryName)
  })
})

describe('getInstalledPackageConfiguration', () => {
  it.each(dependencyTypes.map((type) => [type]))(
    `should return package configuration from %s if present`,
    async (dependencyType) => {
      const masterDirectory = createPackage({
        files: {
          'package.json': {
            name: 'master',
            [dependencyType]: {
              dependent: '^5.0.0',
            },
          },
        },
      })
      await expect(
        getInstalledPackageConfiguration(
          'dependent',
          masterDirectory.cwd.path(),
        ),
      ).resolves.toEqual({
        versionRange: '^5.0.0',
        dependencyType,
      })
    },
  )

  it('should return false if not installed', async () => {
    const masterDirectory = createPackage({})
    await expect(
      getInstalledPackageConfiguration('dependent', masterDirectory.cwd.path()),
    ).resolves.toBeUndefined()
  })
})
