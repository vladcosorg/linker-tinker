import path from 'node:path'

import { Command, Flags } from '@oclif/core'

import { runTasks } from '@/lib/sync/tasks'

export default class Sync extends Command {
  static override description = 'Link and sync a package as a dependency'
  static override args = [
    { name: 'from', description: 'Source package', required: true },
    { name: 'to', description: 'Target package', required: true },
  ] satisfies NonNullable<typeof Command['args']>

  static override flags = {
    verbose: Flags.boolean({ char: 'v' }),
    debug: Flags.boolean({ char: 'd' }),
  }

  async run(): Promise<void> {
    const input = await this.parse(Sync)
    const inputArguments = input.args as Record<'from' | 'to', string>
    const inputFlags = input.flags
    await runTasks({
      renderer: inputFlags.verbose ? 'simple' : 'default',
      ctx: {
        sourcePackagePath: path.resolve(inputArguments.from),
        targetPackagePath: path.resolve(inputArguments.to),
        syncPaths: path.resolve(inputArguments.from),
      },
    })
    // eslint-disable-next-line no-process-exit,unicorn/no-process-exit
    process.exit(0)
  }
}
