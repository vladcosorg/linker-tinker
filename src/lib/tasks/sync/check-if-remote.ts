import { homedir } from 'node:os'
import path from 'node:path'

import chalk from 'chalk'
import fs from 'fs-extra'

import { cloneRepo, runNpmInstallRoot } from '@/lib/executor'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

type LocalContext = PickContext<'sourcePackagePath'>
export const checkIfRemote = createTask((context: LocalContext) => ({
  title: 'Checking if it is a remote package',
  task: async (_, task) => {
    const startsWithValidName = /^[\d@a-z]/.test(context.sourcePackagePath)

    if (!startsWithValidName) {
      task.title += `${chalk.green('[NO]')}`
      context.sourcePackagePath = path.resolve(context.sourcePackagePath)
      return
    }

    const response = await fetch(
      `https://registry.npmjs.org/${context.sourcePackagePath}/latest`,
    )
    const jsonResponse = (await response.json()) as
      | {
          name?: string
          repository?: { url?: string }
        }
      | undefined
    const url = jsonResponse?.repository?.url

    if (!url) {
      throw new Error(
        `The package ${context.sourcePackagePath} does not have a source repo specified`,
      )
    }

    const repo = url?.match(/github\.com\/(.*)\.git/)
    const fullRepo = `git@github.com:${repo[1]}.git`

    context.sourcePackagePath = path.join(
      homedir(),
      'linker-tinker',
      context.sourcePackagePath,
    )
    try {
      const stat = await fs.lstat(context.sourcePackagePath)

      if (!stat?.isDirectory()) {
        throw new Error('The provided path is not a directory')
      }

      task.title = `Using the cloned repository`
    } catch {
      task.title = `Cloning the repo ${chalk.bold(fullRepo)}`
      const process = cloneRepo(fullRepo, context.sourcePackagePath)
      process.all?.pipe(task.stdout())
      await process
    }

    const npmProcess = runNpmInstallRoot(context.sourcePackagePath)
    task.output = 'Installing the repo local repository'
    npmProcess.all?.pipe(task.stdout())
    await npmProcess
  },
}))
