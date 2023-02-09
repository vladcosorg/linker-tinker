import fs from 'fs-extra'

import type { ListrTask } from 'listr2'

export function checkIfThePathExistsTask(userPath: string): ListrTask {
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
