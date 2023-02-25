import jetpack from 'fs-jetpack'

import type { RequiredContext } from '@/lib/context'
import { assembleInstalledPath, getIntermediatePath } from '@/lib/misc'
import type { ContextualTask } from '@/lib/tasks'
import { createTask } from '@/lib/tasks'

export const symlinkTask = createTask<
  | 'dependentPackageName'
  | 'intermediateCacheDirectory'
  | 'noSymlink'
  | 'targetPackagePath'
>((subcontext) => ({
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
}))

type LocalContext = RequiredContext<(typeof symlinkTask)['context'][number]>

export function createSymlinkTask(
  context: () => LocalContext,
): ContextualTask<LocalContext> {
  return {
    enabled() {
      return !context().noSymlink
    },
    title: 'Creating symlink',
    task: async (context): Promise<void> => {
      const nodePackage = assembleInstalledPath(
        context.targetPackagePath,
        context.dependentPackageName,
      )
      await jetpack.removeAsync(nodePackage)
      await jetpack.symlinkAsync(
        getIntermediatePath(
          context.dependentPackageName,
          context.intermediateCacheDirectory,
        ),
        nodePackage,
      )
    },
  }
}
