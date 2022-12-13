import path from 'node:path'

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
