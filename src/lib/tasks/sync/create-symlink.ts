import jetpack from 'fs-jetpack'

import { assembleInstalledPath, getIntermediatePath } from '@/lib/misc'
import type { PickContext } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const symlinkTask = createTask(
  (
    subcontext: PickContext<
      | 'dependentPackageName'
      | 'intermediateCacheDirectory'
      | 'noSymlink'
      | 'targetPackagePath'
    >,
  ) => ({
    title: 'Creating symlink',
    enabled() {
      return !subcontext.noSymlink
    },
    async task() {
      const nodePackage = assembleInstalledPath(
        subcontext.targetPackagePath,
        subcontext.dependentPackageName,
      )
      await jetpack.removeAsync(nodePackage)
      await jetpack.symlinkAsync(
        getIntermediatePath(
          subcontext.dependentPackageName,
          subcontext.intermediateCacheDirectory,
        ),
        nodePackage,
      )
    },
  }),
)
