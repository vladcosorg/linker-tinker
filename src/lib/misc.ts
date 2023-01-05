import path from 'node:path'

import { copy } from 'fs-extra'
import jetpack from 'fs-jetpack'

interface PackageJSON {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

async function getPackageJson(packageDirectory: string): Promise<PackageJSON> {
  const cwd = jetpack.cwd(packageDirectory)
  const contents = (await cwd.readAsync('package.json', 'json')) as
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
  const packageJson = await getPackageJson(packageDirectory)

  if (!packageJson.name) {
    throw new Error(
      `Could not find a package name in the package.json in the directory '${packageDirectory}'`,
    )
  }

  return packageJson.name
}

export async function getPackageNiceName(
  packageDirectory: string,
): Promise<string> {
  let name
  try {
    name = await getPackageName(packageDirectory)
  } catch {
    name = path.basename(packageDirectory)
  }

  return name
}

export async function validateDependentPackage(
  packageDirectory: string,
): Promise<void> {
  await getPackageName(packageDirectory)
}

export async function validateRootPackage(
  packageDirectory: string,
): Promise<void> {
  await getPackageJson(packageDirectory)
}

export async function copyFile(
  fromPath: string,
  toPath: string,
): Promise<void> {
  await copy(fromPath, toPath)
}

function getInstalledPathFromSourcePath(
  sourcePath: string,
  dependentPackagePath: string,
  dependentPackageName: string,
  rootPackagePath: string,
): string {
  return path.join(
    rootPackagePath,
    'node_modules',
    dependentPackageName,
    sourcePath.slice(dependentPackagePath.length + 1),
  )
}

function getSourcePathFromInstalledPath(
  installedPath: string,
  dependentPackagePath: string,
  dependentPackageName: string,
  rootPackagePath: string,
): string {
  const targetDependentPackageRoot = path.join(
    rootPackagePath,
    'node_modules',
    dependentPackageName,
  )
  return path.join(
    dependentPackagePath,
    installedPath.slice(targetDependentPackageRoot.length + 1),
  )
}

export function getOppositePath(
  inputPath: string,
  dependentPackagePath: string,
  dependentPackageName: string,
  rootPackagePath: string,
): string {
  return inputPath.startsWith(dependentPackagePath)
    ? getInstalledPathFromSourcePath(
        inputPath,
        dependentPackagePath,
        dependentPackageName,
        rootPackagePath,
      )
    : getSourcePathFromInstalledPath(
        inputPath,
        dependentPackagePath,
        dependentPackageName,
        rootPackagePath,
      )
}

export async function getInstalledDependencyPath(
  rootPackagePath: string,
  dependentPackagePath: string,
): Promise<string> {
  return path.join(
    rootPackagePath,
    'node_modules',
    await getPackageName(dependentPackagePath),
  )
}

export async function isPackageInstalled(
  packagePath: string,
  dependencyName: string,
): Promise<boolean> {
  const packageJson = await getPackageJson(packagePath)

  return Boolean(
    packageJson.devDependencies?.[dependencyName] ??
      packageJson.dependencies?.[dependencyName],
  )
}

export function formatPathToRelative(
  rootPath: string,
  relativePath: string,
): string {
  return `./${path.relative(path.join(rootPath, '..'), relativePath)}`
}
