import fs from 'fs-extra'

import { createTask } from '@/lib/tasks'

export const checkIfThePathExistsTask = createTask(
  (userPath: () => string) => ({
    title: 'Checking if the path exists and is a directory',
    task: async () => {
      let stat: ReturnType<(typeof fs)['lstatSync']>
      try {
        stat = await fs.lstat(userPath())
      } catch {
        stat = undefined
      }

      if (!stat?.isDirectory()) {
        throw new Error('The provided path is not a directory')
      }
    },
  }),
)
