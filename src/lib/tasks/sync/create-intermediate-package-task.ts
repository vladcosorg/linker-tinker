import path from 'node:path'

import jetpack from 'fs-jetpack'

import { getIntermediatePath } from '@/lib/misc'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const createIntermediatePackageTask = createTask(
  (
    context: PickContext<
      | 'dependentPackageName'
      | 'intermediateCacheDirectory'
      | 'isExiting'
      | 'noSymlink'
      | 'onlyAttach'
      | 'rollbackQueue'
      | 'sourcePackagePath'
      | 'syncPaths'
      | 'targetPackagePath'
    >,
  ) => ({
    title: 'Creating intermediate package',
    enabled() {
      return !context.isExiting && !context.noSymlink && !context.onlyAttach
    },
    async rollback() {
      await jetpack.removeAsync(
        getIntermediatePath(
          context.dependentPackageName,
          context.intermediateCacheDirectory,
        ),
      )
    },
    async task() {
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
  }),
)
