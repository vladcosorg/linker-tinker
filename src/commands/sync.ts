import * as path from 'node:path'

import { Command } from '@oclif/core'
import { watch } from 'chokidar'

import {
  getTargetPath,
  getPackageName,
  removeFileOrDirectory,
  copyFile,
} from '@/lib/misc'

export default class Sync extends Command {
  static override description = 'Start syncing the directory'

  static override args = [
    { name: 'from', description: 'Source package', required: true },
    { name: 'to', description: 'Target package', required: true },
  ] satisfies NonNullable<typeof Command['args']>

  async run(): Promise<void> {
    const { args } = (await this.parse(Sync)) as {
      args: Record<'from' | 'to', string>
    }

    const sourcePackageRoot = path.resolve(args.from)
    const targetPackageRoot = path.resolve(args.to)

    console.log(await getPackageName(sourcePackageRoot))
    console.log(await getPackageName(targetPackageRoot))

    watch(sourcePackageRoot, { ignoreInitial: true }).on(
      'all',
      (eventName, sourcePath, stats) => {
        void getTargetPath(
          sourcePath,
          sourcePackageRoot,
          targetPackageRoot,
        ).then(async (targetPath) => {
          switch (eventName) {
            case 'add':
            case 'change': {
              await copyFile(sourcePath, targetPath)
              break
            }

            case 'unlink':
            case 'unlinkDir': {
              await removeFileOrDirectory(targetPath)
              break
            }

            default: {
              throw new Error(`Unknown event ${eventName}`)
            }
          }
        })
      },
    )
  }
}
