import path from 'node:path'

import { copy } from 'fs-extra'
import jetpack from 'fs-jetpack'

import { execNpm } from '@/lib/child-process'

interface PackageJSON {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

async function readPackageJson(packageDirectory: string): Promise<PackageJSON> {
  const cwd = jetpack.cwd(packageDirectory)
  const contents = (await cwd.readAsync('packaged.json', 'json')) as
    | PackageJSON
    | undefined

  if (!contents) {
    throw new Error(
      `Could not find a package.json file in the directory '${packageDirectory}'`,
    )
  }

  return contents
}

export async function getPackageName(
  packageDirectory: string,
): Promise<string> {
  const packageJson = await readPackageJson(packageDirectory)
  if (!packageJson.name) {
    throw new Error(
      `Could not find a package name in the package.json in the directory '${packageDirectory}'`,
    )
  }

  return packageJson.name
}

export async function copyFile(
  fromPath: string,
  toPath: string,
): Promise<void> {
  await copy(fromPath, toPath)
}

export async function getTargetPath(
  sourcePath: string,
  sourcePackageRoot: string,
  targetPackageRoot: string,
): Promise<string> {
  return path.join(
    targetPackageRoot,
    'node_modules',
    await getPackageName(sourcePackageRoot),
    sourcePath.slice(sourcePackageRoot.length + 1),
  )
}

export async function isPackageInstalled(
  packagePath: string,
  dependencyName: string,
): Promise<boolean> {
  const packageJson = await readPackageJson(packagePath)

  return Boolean(
    packageJson.devDependencies?.[dependencyName] ??
      packageJson.dependencies?.[dependencyName],
  )
}

export async function installPackage(
  packagePath: string,
  dependencyName: string,
): Promise<void> {
  await execNpm(`install  '${dependencyName}'`, {
    options: ['no-save', 'install-links'],
    cwd: packagePath,
  })
}

export function formatPathToRelative(
  rootPath: string,
  relativePath: string,
): string {
  return `./${path.relative(path.join(rootPath, '..'), relativePath)}`
}
