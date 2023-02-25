import path from 'node:path'

import jetpack from 'fs-jetpack'
import { afterEach } from 'vitest'

import type { FSJetpack } from 'fs-jetpack/types'

export function getTestTemporaryDirectory(): FSJetpack {
  return jetpack.tmpDir()
}

const packageJson = 'package.json'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getFsHelpers() {
  const testTemporaryDirectory = getTestTemporaryDirectory()
  afterEach(() => {
    testTemporaryDirectory.dir(testTemporaryDirectory.path(), { empty: true })
  })

  return {
    createPackage: ({
      directoryName,
      packageName = 'foo-dependency',
      files = {},
    }: {
      directoryName?: string
      packageName?: string
      files?: Record<string, object | string>
    } = {}) => {
      let rootDirectory = directoryName ?? packageName

      if (!files[packageJson]) {
        files[packageJson] = {
          name: packageName,
        }
      } else if (
        typeof files[packageJson] === 'object' &&
        'name' in files[packageJson]
      ) {
        rootDirectory = files[packageJson].name as string
      }

      const cwd = testTemporaryDirectory.cwd(rootDirectory)
      // In case we create the same package repeatedly the scope of the same temp dir
      testTemporaryDirectory.dir(rootDirectory, { empty: true })

      for (const [file, content] of Object.entries(files)) {
        cwd.file(file, {
          content,
        })
      }

      return {
        packageName,
        cwd,
      }
    },
    temporaryCwd: testTemporaryDirectory,
  }
}

export function readPackageJson(packageDirectory: string): Record<string, any> {
  return jetpack.read(
    path.join(packageDirectory, 'package.json'),
    'json',
  ) as unknown as { version: string }
}
