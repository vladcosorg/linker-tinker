import path from 'node:path'

import { readJson, copy, remove } from 'fs-extra'

async function readPackageJson(
  packageDirectory: string,
): Promise<{ name?: string }> {
  return (await readJson(
    path.join(packageDirectory, 'package.json'),
  )) as Promise<{ name?: string }>
}

export async function getPackageName(
  packageDirectory: string,
): Promise<string> {
  const packageJson = await readPackageJson(packageDirectory)
  if (!packageJson.name) {
    throw new Error(
      `Could not find a package name in the directory '${packageDirectory}'`,
    )
  }

  return packageJson.name
}

export async function copyFile(
  fromPath: string,
  toPath: string,
): Promise<void> {
  await copy(fromPath, toPath)
  console.log(`Copied from ${fromPath} to ${toPath}`)
}

export async function removeFileOrDirectory(targetPath: string): Promise<void> {
  await remove(targetPath)
  console.log(`Removed  ${targetPath}`)
}

export async function getTargetPath(
  sourcePath: string,
  sourcePackageRoot: string,
  targetPackageRoot: string,
): Promise<string> {
  return path.join(
    targetPackageRoot,
    'node_modules',
    await getPackageName(sourcePath),
    sourcePath.slice(sourcePackageRoot.length + 1),
  )
}

export function createAction(action, targetPackage) {
  return function () {
    action()
  }
}
