import fs from 'fs-extra'

import type { Context } from '@/lib/sync/tasks'

import type { ListrTask } from 'listr2'

export function checkIfThePathExistsTask(userPath: string): ListrTask<Context> {
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
