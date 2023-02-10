import path from 'node:path'

import { Flags } from '@oclif/core'
import chalk from 'chalk'

import { BaseCommand } from '@/lib/base-command'
import { getInputArgs } from '@/lib/command'
import { backupInstalledVersion } from '@/lib/tasks/sync/backup-installed-version'
import { createIntermediatePackageTask } from '@/lib/tasks/sync/create-intermediate-package-task'
import { createSymlinkTask } from '@/lib/tasks/sync/create-symlink'
import { getPackListTask } from '@/lib/tasks/sync/get-pack-list-task'
import { initializeStorageTask } from '@/lib/tasks/sync/initialize-storage-task'
import { installTheDependentPackageTask } from '@/lib/tasks/sync/install-dependent-package-task'
import { startBackgroundWatcher } from '@/lib/tasks/sync/start-background-watcher'
import { verifyDependencyTask } from '@/lib/tasks/verify-dependency-task'
import { verifyTargetTask } from '@/lib/tasks/verify-target-task'
import { runTasks } from '@/task-runner'

export default class Link extends BaseCommand<typeof Link> {
  static override description = 'Link and sync a package as a dependency'

  static override examples = [
    {
      description: 'Force the command to execute',
      command: '<%= config.bin %> <%= command.id %> --force',
    },
  ]

  static override args = getInputArgs()
  static override flags = {
    noSymlink: Flags.boolean({
      char: 'n',
      description: 'Do not use symlink',
      default: false,
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
    await runTasks(
      [
        verifyDependencyTask(),
        verifyTargetTask(),
        initializeStorageTask(),
        backupInstalledVersion(),
        getPackListTask(),
        createIntermediatePackageTask(),
        installTheDependentPackageTask(),
        createSymlinkTask(),
        startBackgroundWatcher(),
      ],
      this.getOptions(),
    )
  }

  protected getOptions() {
    return {
      renderer: this.getRendererType(),
      ctx: this.createContext({
        skipWatch: this.flags.skipWatch,
        noSymlink: this.flags.noSymlink,
        sourcePackagePath: path.resolve(this.args.from),
        targetPackagePath: path.resolve(this.args.to),
        syncPaths: path.resolve(this.args.from),
        runWatcherScript: this.flags.watcherScript,
        bidirectionalSync: this.flags.bidirectionalSync,
        watchAll: this.flags.watchAll,
        pendingBidirectionalUpdates: { fromSource: [], toSource: [] },
        dependentPackageName: '',
        onlyAttach: false,
      }),
    }
  }
}
