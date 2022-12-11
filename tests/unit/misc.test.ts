import path from 'node:path'

import { readJson } from 'fs-extra'
import { expect, it, vi } from 'vitest'

import { getPackList, getTargetPath } from '@/lib/misc'

vi.mock('fs-extra', () => ({
  readJson: vi.fn(),
}))

it('should return a path to a package in node_modules', async () => {
  const sourcePackageName = 'source-package'

  const sourcePath = '/path/to/source-root/src/file.ts'
  const sourceRoot = '/path/to/source-root'

  const targetRoot = '/path/to/target-root'
  const targetPath = `/path/to/target-root/node_modules/${sourcePackageName}/src/file.ts`

  vi.mocked(readJson).mockResolvedValue({ name: sourcePackageName })
  await expect(getTargetPath(sourcePath, sourceRoot, targetRoot)).resolves.toBe(
    targetPath,
  )
})

it('should return a pack list', () => {
  const packageRoot = path.resolve('.')
  const result = getPackList(path.resolve('.'))
  expect(result).toBeInstanceOf(Array)
  expect(result[0]).toMatch(packageRoot)
})

// it('should return whether an input is a part of a pack list', () => {
//   const packList = ['package.json', 'dist/index.js']
//   expect(
//     isInPackList(
//       path.resolve('.'),
//       path.resolve(path.join('.', 'package.json')),
//       packList,
//     ),
//   ).toBe(true)
// })
