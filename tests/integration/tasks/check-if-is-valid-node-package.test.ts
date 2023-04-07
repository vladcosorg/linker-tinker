import jetpack from 'fs-jetpack'
import { Listr } from 'listr2'
import { beforeEach, describe, expect, test } from 'vitest'

import type { Context } from '@/lib/context'

import { checkIfIsValidNodePackageTask } from '../../../src/lib/tasks/sync/check-if-is-valid-node-package-task'
import { getFsHelpers } from '../../unit/helpers'

interface LocalTestContext {
  context: Parameters<typeof checkIfIsValidNodePackageTask>[0]
}
const { createPackage, temporaryCwd } = getFsHelpers()

async function runTask(
  ...parameters: Parameters<typeof checkIfIsValidNodePackageTask>
) {
  return new Listr([checkIfIsValidNodePackageTask(...parameters)]).run()
}

beforeEach<LocalTestContext>((testContext) => {
  testContext.context = { dependentPackageName: '' }
})

describe('Validate as dependent pacakge', () => {
  test<LocalTestContext>('should run sucessfully because the package is valid', async ({
    context,
  }) => {
    const randomPackage = createPackage()

    const result = runTask(context, {
      packagePath: randomPackage.cwd.path(),
      isRoot: false,
    })

    await expect(result).resolves.not.toThrow()
    expect(context.dependentPackageName).toBe(randomPackage.packageName)
  })

  test('should fail because the package does not have a name', async () => {
    const randomPackage = createPackage({
      files: {
        'package.json': {
          dependencies: {},
        },
      },
    })
    const context = { dependentPackageName: '' } satisfies Partial<Context>
    const result = runTask(context, {
      packagePath: randomPackage.cwd.path(),
      isRoot: false,
    })

    await expect(result).rejects.toThrow()
    expect(context.dependentPackageName).toBe('')
  })
})

describe('Validate as root pacakge', () => {
  test<LocalTestContext>('should run sucessfully because the package is valid even if it doesnt have a name', async ({
    context,
  }) => {
    const randomPackage = createPackage({
      files: {
        'package.json': {
          dependencies: {},
        },
      },
    })
    const result = runTask(context, {
      packagePath: randomPackage.cwd.path(),
      isRoot: true,
    })

    await expect(result).resolves.not.toThrow()
  })

  test<LocalTestContext>('should fail because it doesnt have a package.json', async ({
    context,
  }) => {
    const randomPackage = createPackage({
      files: {
        'package.json': {
          dependencies: {},
        },
      },
    })
    jetpack.remove(randomPackage.cwd.path('package.json'))
    const result = runTask(context, {
      packagePath: randomPackage.cwd.path(),
      isRoot: true,
    })

    await expect(result).rejects.toThrow()
  })

  test<LocalTestContext>('should fail because the path does not exist', async ({
    context,
  }) => {
    const result = runTask(context, {
      packagePath: temporaryCwd.path('non-existent-path'),
      isRoot: true,
    })

    await expect(result).rejects.toThrow()
  })
})
