import type { RequiredContext } from '@/lib/context'
import type { PackageConfig } from '@/lib/run'
import { runNpmInstall, runNpmUninstall } from '@/lib/run'
import type { Task } from '@/lib/sync/tasks'

export function restorePackageOriginalVersion(
  targetPackage: string,
  packageConfig: PackageConfig,
): Task<RequiredContext<'dependentPackageName'>> {
  return {
    title: 'Restoring original version',
    task: async (context, task): Promise<void> => {
      packageConfig
        ? (task.title = `The package [${
            context.dependentPackageName
          }]  version is going to be reaplaced with ${packageConfig.versionRange!}`)
        : (task.title = `The package [${context.dependentPackageName}] is going to be uninstalled`)

      const child = packageConfig
        ? runNpmInstall(
            targetPackage,
            context.dependentPackageName,
            packageConfig,
          )
        : runNpmUninstall(targetPackage, context.dependentPackageName)
      child.all?.pipe(task.stdout())
      await child
    },
  }
}
