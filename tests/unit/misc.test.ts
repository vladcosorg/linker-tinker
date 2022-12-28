import path from 'node:path'

import { expect, it, describe } from 'vitest'

import { getTargetPath, getPackageName } from '@/lib/misc'
import { getPackList } from '@/lib/packlist'

import { getFsHelpers } from './helpers'

const { createPackage, temporaryCwd } = getFsHelpers()

it('should return a path to a package in node_modules', async () => {
  const { cwd, packageName } = createPackage()
  const relativeDepencencyFilePath = 'dist/file.ts'
  const dependencyFilePath = cwd.path(relativeDepencencyFilePath)

  const primaryRoot = temporaryCwd.cwd('primary')
  const actualResult = await getTargetPath(
    dependencyFilePath,
    cwd.path(),
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
