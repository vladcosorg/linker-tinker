import fs from 'fs-extra'
import { ListrTask } from 'listr2'

import { Context } from '@/commands/sync/tasks'

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
