import { execa } from 'execa'
import { createPromiseMixin } from 'promise-supplement'

import { debugConsole } from '@/lib/debug'
import { eventBus } from '@/lib/event-emitter'
import type { dependencyTypes as dependencyTypeList } from '@/lib/misc'

import type { ExecaChildProcess } from 'execa'

export const cancellableExeca = function (
  ...parameters: Parameters<typeof execa>
) {
  debugConsole.log(parameters)

  const originalChild = execa(...(parameters as Parameters<typeof execa>))
  const child = createPromiseMixin(originalChild.then(), originalChild)

  const cancelHandler = () => {
    child.cancel()
  }

  eventBus.once('exitImmediately', cancelHandler)

  return (
    child
      .then((result) => {
        debugConsole.log(result.command)
        return result
      })
      // .catch((error) => {
      //   debugConsole.log(error)
      //   throw error
      // })
      .finally(() => {
        eventBus.removeListener('exitImmediately', cancelHandler)
      })
  )

  // void (async () => {
  //   try {
  //     const result = await child
  //     debugConsole.log(result.command)
  //   } catch (error) {
  //     debugConsole.log(error)
  //   } finally {
  //     eventBus.removeListener('exitImmediately', cancelHandler)
  //   }
  // })()
} as unknown as typeof execa

const activeProcesses: Record<string, ExecaChildProcess> = {}

export function abortableExeca(
  id: string,
  command: string,
  commandArguments?: readonly string[],
  options?: execa.Options,
) {
  if (id in activeProcesses) {
    activeProcesses[id]?.cancel()
    delete activeProcesses[id]
  }

  // console.log(
  //   'aaa1',
  //   util.inspect(promise, { depth: 1, colors: true }),
  //   util.inspect(promise.then(), { depth: 1, colors: true }),
  // )

  const promise = cancellableExeca(command, commandArguments, {
    ...options,
  })

  promise.catch((error) => {
    if (!error.isCanceled) {
      throw error
    }

    return error
  })

  activeProcesses[id] = promise
  return promise
}

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
  save = true,
): ExecaChildProcess {
  return cancellableExeca(
    'npm',
    ['uninstall', dependencyName, save ? '--save' : '--no-save'],
    {
      cwd: rootPackagePath,
      all: true,
    },
  )
}

export function runNpmInstallRoot(rootPackagePath: string): ExecaChildProcess {
  return cancellableExeca(
    'npm',
    ['install', '--no-audit', '--no-fund', '--ignore-scripts'],
    {
      cwd: rootPackagePath,
      all: true,
    },
  )
}
