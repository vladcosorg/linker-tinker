import fs from 'fs-extra'

import { createTask } from '@/lib/tasks'

export const checkIfThePathExistsTask = createTask((userPath: string) => ({
  title: 'Checking if the path exists and is a directory',
  task: async () => {
    const stat = await fs.lstat(userPath)

    if (!stat.isDirectory()) {
      throw new Error('The provided path is not a directory')
    }
  },
}))
