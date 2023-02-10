import path from 'node:path'

import jetpack, { removeAsync } from 'fs-jetpack'

import { getIntermediatePath } from '@/lib/misc'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function createSymlinkTask(): ContextualTaskWithRequired<
  'dependentPackageName' | 'noSymlink' | 'targetPackagePath'
> {
  return {
    enabled(context) {
      return !context.noSymlink
    },
    title: 'Creating symlink',
    task: async (context): Promise<void> => {
      const nodePackage = path.join(
        context.targetPackagePath,
        'node_modules',
        context.dependentPackageName,
      )
      await removeAsync(nodePackage)
      await jetpack.symlinkAsync(
        await getIntermediatePath(context.dependentPackageName),
        nodePackage,
      )
    },
  }
}
