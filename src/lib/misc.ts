import path from 'node:path'

import { copy, readJson, remove } from 'fs-extra'
import { z } from 'zod'

import { execNpm } from '@/lib/child-process'

interface PackageJSON {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

async function readPackageJson(packageDirectory: string): Promise<PackageJSON> {
  return readJson(path.join(packageDirectory, 'package.json'))
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

export async function removeFileOrDirectory(targetPath: string): Promise<void> {
  await remove(targetPath)
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

function getValidationRules(packageRoot: string) {
  return z
    .array(
      z
        .object({
          files: z
            .array(
              z
                .object({ path: z.string() })
                .transform((value) => path.join(packageRoot, value.path)),
            )
            .nonempty(),
        })
        .transform((value) => value.files),
    )
    .nonempty()
    .length(1)
    .transform((value) => value[0])
}

export async function getPackList(
  sourcePackageRoot: string,
): Promise<z.infer<ReturnType<typeof getValidationRules>>> {
  const output = await execNpm('pack', {
    options: ['dry-run', 'json'],
    cwd: sourcePackageRoot,
  })
  // console.log(output)
  return getValidationRules(sourcePackageRoot).parse(
    JSON.parse(output.toString()),
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
    options: ['save-dev'],
    cwd: packagePath,
  })
}

export async function getWatchedFiles(
  sourcePackageRoot: string,
): Promise<string[] | string> {
  try {
    return await getPackList(sourcePackageRoot)
  } catch {
    // console.log(getErrorMessage(error))
    return sourcePackageRoot
  }
}

export function formatPathToRelative(
  rootPath: string,
  relativePath: string,
): string {
  return `./${path.relative(path.join(rootPath, '..'), relativePath)}`
}
