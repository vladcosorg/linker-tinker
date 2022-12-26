import { afterEach, describe, expect, it } from 'vitest'

import { removeFileAndContainingDirectoryIfEmpty } from '@/lib/fs'

import { getTestTemporaryDirectory } from './helpers'

const testTemporaryDirectory = getTestTemporaryDirectory()
afterEach(() => {
  testTemporaryDirectory.dir(testTemporaryDirectory.path(), { empty: true })
})

describe('handling orphan folders left after deleting the only file', () => {
  describe('if the path is partially non-existent, then', () => {
    it('should delete the containing dir if folder is empty', async () => {
      const file = testTemporaryDirectory.dir('emptydir', { empty: true })
      await removeFileAndContainingDirectoryIfEmpty(file.path('foo.js'))
      expect(file.exists(file.path())).toBe(false)
    })

    it('should do nothing if the containing dir is also missing', async () => {
      expect(async () =>
        removeFileAndContainingDirectoryIfEmpty(
          testTemporaryDirectory.path('foo'),
        ),
      ).not.rejects
    })
  })

  it('should remove the folder left after deleting the only file', async () => {
    const file = testTemporaryDirectory
      .dir('emptydir', { empty: true })
      .file('foo.js', { content: 'aaa' })
    await removeFileAndContainingDirectoryIfEmpty(file.path('foo.js'))
    expect(file.exists(file.path())).toBe(false)
  })

  it('should remove the folder and if the dir is empty after that, remove the dir as well', async () => {
    const file = testTemporaryDirectory
      .dir('emptydir', { empty: true })
      .file('foo.js', { content: 'aaa' })
      .file('bar.js', { content: 'aaa' })
    await removeFileAndContainingDirectoryIfEmpty(file.path('foo.js'))
    expect(file.exists(file.path())).toBe('dir')
  })
})
