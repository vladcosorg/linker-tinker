import path from 'node:path'
import process from 'node:process'

import { Args, Command, Flags } from '@oclif/core'
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

  static override args = {
    from: Args.string({
      description: 'Path to a package that you want to link',
      required: true,
    }),
    to: Args.string({
      description: `Target package. If not specified, it will use the current cwd`,
      required: false,
      default: process.cwd(),
    }),
  }

  static override flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Display a verbose action list',
      default: false,
    }),
    noSymlink: Flags.boolean({
      char: 'n',
      description: 'Do not use symlink',
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
    const { args, flags } = await this.parse(Sync)

    if (flags.debug) {
      enableDebug()
    }

    await runTasks({
      renderer: flags.verbose || flags.debug ? 'simple' : 'default',
      ctx: {
        skipWatch: flags.skipWatch,
        noSymlink: flags.noSymlink,
        isExiting: false,
        sourcePackagePath: path.resolve(args.from),
        targetPackagePath: path.resolve(args.to),
        syncPaths: path.resolve(args.from),
        runWatcherScript: flags.watcherScript,
        debug: flags.debug,
        bidirectionalSync: flags.bidirectionalSync,
        watchAll: flags.watchAll,
        pendingBidirectionalUpdates: { fromSource: [], toSource: [] },
        dependentPackageName: '',
        intermediatePackagePath: '',
      },
    })
  }
}
