import execa from 'execa'

import { debugConsole } from '@/lib/debug'
import { eventBus } from '@/lib/event-emitter'
import type { dependencyTypes as dependencyTypeList } from '@/lib/misc'

import type { ExecaChildProcess } from 'execa'

const cancellableExeca = function (...parameters: Parameters<typeof execa>) {
  debugConsole.log(parameters)
  const child = execa(...(parameters as Parameters<typeof execa>))
  eventBus.on('exitImmediately', () => {
    child.cancel()
  })
  void child.then((result) => {
    debugConsole.log(result.command)
    return result
  })
  return child
} as unknown as typeof execa

export type PackageConfig = {
  dependencyType?: (typeof dependencyTypeList)[number]
  versionRange?: string
} | null

export function runNpmInstall(
  rootPackagePath: string,
  dependencyName: string,
  config: PackageConfig = {},
): ExecaChildProcess {
  const dependencyTypeFlags: Record<
    (typeof dependencyTypeList)[number],
    string
  > = {
    dependencies: '--save-prod',
    devDependencies: '--save-dev',
  }

  const options = [
    'install',
    config?.versionRange
      ? `${dependencyName}@${config.versionRange}`
      : dependencyName,
    '--install-links',
    '--no-audit',
    '--no-fund',
    '--ignore-scripts',
  ]

  if (config?.dependencyType) {
    options.push(dependencyTypeFlags[config.dependencyType])
  }

  return cancellableExeca('npm', options, {
    cwd: rootPackagePath,
    all: true,
    shell: true,
  })
}

export function runNpmLink(
  rootPackagePath: string,
  dependencyName: string,
  {
    versionRange,
    dependencyType,
  }: {
    dependencyType?: (typeof dependencyTypeList)[number]
    versionRange?: string
  } = {},
): ExecaChildProcess {
  const dependencyTypeFlags: Record<
    (typeof dependencyTypeList)[number],
    string
  > = {
    dependencies: '--save-prod',
    devDependencies: '--save-dev',
  }
  const options = [
    'link',
    versionRange ? `${dependencyName}@${versionRange}` : dependencyName,
    '--install-links',
  ]

  if (dependencyType) {
    options.push(dependencyTypeFlags[dependencyType])
  }

  return cancellableExeca('npm', options, {
    cwd: rootPackagePath,
    all: true,
    shell: true,
  })
}

export function runNpmUninstall(
  rootPackagePath: string,
  dependencyName: string,
): ExecaChildProcess {
  return cancellableExeca('npm', ['uninstall', dependencyName, '--save'], {
    cwd: rootPackagePath,
    all: true,
  })
}

export function runNpmReinstall(rootPackagePath: string): ExecaChildProcess {
  return cancellableExeca(
    'npm',
    ['install', '--no-audit', '--no-fund', '--ignore-scripts'],
    {
      cwd: rootPackagePath,
      all: true,
    },
  )
}
