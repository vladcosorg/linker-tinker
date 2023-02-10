import path from 'node:path'

import jetpack from 'fs-jetpack'

import { getIntermediatePath } from '@/lib/misc'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function createIntermediatePackageTask(): ContextualTaskWithRequired<
  | 'dependentPackageName'
  | 'isExiting'
  | 'noSymlink'
  | 'onlyAttach'
  | 'sourcePackagePath'
  | 'syncPaths'
> {
  return {
    enabled(context) {
      return !context.isExiting && !context.noSymlink && !context.onlyAttach
    },
    title: 'Creating intermediate package',
    task: async (context) => {
      if (Array.isArray(context.syncPaths)) {
        await Promise.all(
          context.syncPaths.map(async (filePath) =>
            jetpack.copyAsync(
              path.join(context.sourcePackagePath, filePath),
              path.join(
                await getIntermediatePath(context.dependentPackageName),
                filePath,
              ),
              {
                overwrite: true,
              },
            ),
          ),
        )
      }
    },
  }
}
