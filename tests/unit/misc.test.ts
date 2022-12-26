import path from 'node:path'

import { read } from 'fs-jetpack'
import { expect, it, vi } from 'vitest'

import { getTargetPath } from '@/lib/misc'
import { getPackList } from '@/lib/packlist'

vi.mock('fs-jetpack', () => ({
  read: vi.fn(),
}))

it('should return a path to a package in node_modules', async () => {
  const sourcePackageName = 'source-package'

  const sourcePath = '/path/to/source-root/src/file.ts'
  const sourceRoot = '/path/to/source-root'

  const targetRoot = '/path/to/target-root'
  const targetPath = `/path/to/target-root/node_modules/${sourcePackageName}/src/file.ts`

  vi.mocked(read).mockResolvedValue({ name: sourcePackageName })
  await expect(getTargetPath(sourcePath, sourceRoot, targetRoot)).resolves.toBe(
    targetPath,
  )
})

it('should return a pack list', async () => {
  const result = await getPackList(path.resolve('.'))
  expect(result).toBeInstanceOf(Array)
  expect(result).includes('package.json')
})
