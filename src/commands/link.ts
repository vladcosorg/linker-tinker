import path from 'node:path'

import { Flags } from '@oclif/core'
import chalk from 'chalk'

import { BaseCommand } from '@/lib/base-command'
import { getInputArgs } from '@/lib/command'
import { runRollbackTasks } from '@/lib/tasks/run-rollback-tasks'
import { backupInstalledVersion } from '@/lib/tasks/sync/backup-installed-version'
import { checkIntegrityIssues } from '@/lib/tasks/sync/check-integrity-issues'
import { createIntermediatePackageTask } from '@/lib/tasks/sync/create-intermediate-package-task'
import { symlinkTask } from '@/lib/tasks/sync/create-symlink'
import { getPackListTask } from '@/lib/tasks/sync/get-pack-list-task'
import { initializeStorageTask } from '@/lib/tasks/sync/initialize-storage-task'
import { installDependentPackageTask } from '@/lib/tasks/sync/install-dependent-package-task'
import { restoreOriginalVersion } from '@/lib/tasks/sync/restore-original-version'
import { startWatcher } from '@/lib/tasks/sync/start-watcher'
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
    foregroundWatcher: Flags.boolean({
      char: 'f',
      description: 'Run foreground watcher',
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
    runDependencyWatcher: Flags.boolean({
      char: 'w',
      description: `Runs the ${chalk.bold(
        '"watch"',
      )} task automatically if present on the target package`,
      default: false,
    }),
    watcherScript: Flags.string({
      char: 'n',
      description:
        'Name of the watcher script in the dependent package.json to be executed. It will fail if the script exits prematurely or does not exist.',
    }),
  }

  async run(): Promise<void> {
    await runTasks(
      (context) => [
        verifyTargetTask(context),
        verifyDependencyTask(context),
        checkIntegrityIssues(context),
        initializeStorageTask(context),
        backupInstalledVersion(context),
        getPackListTask(context),
        createIntermediatePackageTask(context),
        installDependentPackageTask(context),
        symlinkTask(context),
        startWatcher(context),
        restoreOriginalVersion(context),
        runRollbackTasks(),
      ],
      await this.getOptions(),
    )
  }

  protected async getOptions() {
    return {
      renderer: this.getRendererType(),
      ctx: await this.createContext({
        skipWatch: this.flags.skipWatch,
        noSymlink: this.flags.noSymlink,
        sourcePackagePath: this.args.from,
        targetPackagePath: path.resolve(this.args.to),
        syncPaths: path.resolve(this.args.from),
        runWatcherScript: this.flags.runDependencyWatcher
          ? this.flags.watcherScript ?? 'watch'
          : undefined,
        bidirectionalSync: this.flags.bidirectionalSync,
        watchAll: this.flags.watchAll,
        pendingBidirectionalUpdates: { fromSource: [], toSource: [] },
        dependentPackageName: '',
        foregroundWatcher: this.flags.foregroundWatcher,
        onlyAttach: false,
      }),
    }
  }
}
