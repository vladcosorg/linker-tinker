import execa from 'execa'

import type { ExecaChildProcess } from 'execa'

export function runNpmInstall(
  rootPackagePath: string,
  dependencyName: string,
): ExecaChildProcess {
  return execa(
    'npm',
    ['install', dependencyName, '--no-save', '--install-links'],
    { cwd: rootPackagePath, all: true },
  )
}

export function runNpmReinstall(rootPackagePath: string): ExecaChildProcess {
  return execa('npm', ['install'], { cwd: rootPackagePath, all: true })
}
