import fs from 'fs-extra'

import type { ContextualTaskWithRequired } from '@/lib/tasks'

export function checkIfThePathExistsTask(
  userPath: string,
): ContextualTaskWithRequired {
  return {
    title: 'Checking if the path exists and is a directory',
    task: async () => {
      const stat = await fs.lstat(userPath)

      if (!stat.isDirectory()) {
        throw new Error('The provided path is not a directory')
      }
    },
  }
}
