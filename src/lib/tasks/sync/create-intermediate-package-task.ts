import path from 'node:path'

import jetpack from 'fs-jetpack'

import { getIntermediatePath } from '@/lib/misc'
import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function createIntermediatePackageTask(): ContextualTaskWithRequired<
  | 'dependentPackageName'
  | 'intermediateCacheDirectory'
  | 'isExiting'
  | 'noSymlink'
  | 'onlyAttach'
  | 'rollbackQueue'
  | 'sourcePackagePath'
  | 'syncPaths'
  | 'targetPackagePath'
> {
  return {
    title: 'Creating intermediate package',
    enabled(context) {
      return !context.isExiting && !context.noSymlink && !context.onlyAttach
    },
    async rollback(context) {
      await jetpack.removeAsync(
        getIntermediatePath(
          context.dependentPackageName,
          context.intermediateCacheDirectory,
        ),
      )
    },
    async task(context) {
      context.rollbackQueue.push({
        title: `Rollback: ${this.title}`,
        task: this.tasks.rollback,
      })

      console.log(context.rollbackQueue)
      const intermediatePath = getIntermediatePath(
        context.dependentPackageName,
        context.intermediateCacheDirectory,
      )
      await jetpack.removeAsync(intermediatePath)
      if (Array.isArray(context.syncPaths)) {
        await Promise.all(
          context.syncPaths.map(async (filePath) =>
            jetpack.copyAsync(
              path.join(context.sourcePackagePath, filePath),
              path.join(intermediatePath, filePath),
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
