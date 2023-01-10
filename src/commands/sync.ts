import path from 'node:path'
import process from 'node:process'

import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { enableDebug } from '@/lib/debug'
import { runTasks } from '@/lib/sync/tasks'

export default class Sync extends Command {
  static override description = 'Link and sync a package as a dependency'

  static override examples = [
    {
      description: 'Force the command to execute',
      command: '<%= config.bin %> <%= command.id %> --force',
    },
  ]

  static override args = [
    {
      name: 'from',
      description: 'Path to a package that you want to link',
      required: true,
    },
    {
      name: 'to',
      description: `Target package. If not specified, it will use the current cwd`,
      required: false,
      default: () => process.cwd(),
    },
  ] satisfies NonNullable<typeof Command['args']>

  static override flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Display a verbose action list',
      default: false,
    }),
    debug: Flags.boolean({
      char: 'd',
      default: false,
      description:
        'Enables the verbose mode and displays additional debug info that may help you',
    }),
    bidirectionalSync: Flags.boolean({
      char: 'b',
      default: false,
      description: 'Enabled bidirectional sync',
    }),
    skipWatch: Flags.boolean({
      char: 's',
      default: false,
      hidden: true,
    }),
    watchAll: Flags.boolean({
      char: 'a',
      default: false,
      description: `Sync  all the changes in the ${chalk.bold(
        'dependent',
      )} package. By default, this utility will watch only for the paths returned by ${chalk.green(
        '`npm pack`',
      )}`,
    }),
    watcherScript: Flags.string({
      char: 'w',
      description:
        'Name of the watcher script in the dependent package.json to be executed. It will fail if the script prematurely or does not exist.',
    }),
  }

  async run(): Promise<void> {
    const input = await this.parse(Sync)
    const inputArguments = input.args as Record<'from' | 'to', string>
    const inputFlags = input.flags

    if (inputFlags.debug) {
      enableDebug()
    }

    await runTasks({
      renderer: inputFlags.verbose || inputFlags.debug ? 'simple' : 'default',
      ctx: {
        skipWatch: inputFlags.skipWatch,
        isExiting: false,
        sourcePackagePath: path.resolve(inputArguments.from),
        targetPackagePath: path.resolve(inputArguments.to),
        syncPaths: path.resolve(inputArguments.from),
        runWatcherScript: inputFlags.watcherScript,
        debug: inputFlags.debug,
        bidirectionalSync: inputFlags.bidirectionalSync,
        watchAll: inputFlags.watchAll,
        pendingBidirectionalUpdates: { fromSource: [], toSource: [] },
        dependentPackageName: '',
      },
    })
  }
}
