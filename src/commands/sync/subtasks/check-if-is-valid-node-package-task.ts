import { ListrTask } from 'listr2'
import { getPackageName } from '@/lib/misc'

export function checkIfIsValidNodePackageTask(packagePath: string): ListrTask {
  return {
    title: 'Checking if the path is a valid node package',
    task: async (context, task): Promise<void> => {
      const name = await getPackageName(packagePath)
      task.output = `Found package ${name}`
    },
    options: { persistentOutput: true },
  }
}
