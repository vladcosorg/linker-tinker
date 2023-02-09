import path from 'node:path'

import getCacheDir from 'cachedir'
import jetpack from 'fs-jetpack'

export async function removeFileAndContainingDirectoryIfEmpty(
  filePath: string,
): Promise<void> {
  const fileDirectory = path.dirname(filePath)
  const folderFiles = await jetpack.listAsync(path.dirname(filePath))
  if (folderFiles === undefined) {
    return
  }

  if (folderFiles.length === 1 && folderFiles[0] === path.basename(filePath)) {
    await jetpack.removeAsync(filePath)
    folderFiles.length = 0
  }

  if (folderFiles.length === 0) {
    await jetpack.removeAsync(fileDirectory)
  }
}

async function createCacheDirectory(cacheDirectory: string): Promise<void> {
  if (await jetpack.existsAsync(cacheDirectory)) {
    return
  }

  await jetpack.dirAsync(cacheDirectory)
}

const createdDirectories: Record<string, string> = {}
export async function getGlobalCacheDirectory(name: string): Promise<string> {
  let cachedCacheDirectory = createdDirectories[name]

  if (!cachedCacheDirectory) {
    cachedCacheDirectory = getCacheDir(name)
    await createCacheDirectory(cachedCacheDirectory)
  }

  return cachedCacheDirectory
}
