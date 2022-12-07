import { readJson } from 'fs-extra'
import { expect, it, vi } from 'vitest'

import { getTargetPath } from '@/lib/misc'

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
