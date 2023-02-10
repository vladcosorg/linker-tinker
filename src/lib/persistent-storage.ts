import Conf from 'conf'
import { merge, omit } from 'lodash'

import type { RequiredContext } from '@/lib/context'
import { debugConsole } from '@/lib/debug'
import { eventBus } from '@/lib/event-emitter'
import type { dependencyTypes as dependencyTypeList } from '@/lib/misc'
import { getInstalledPackageConfiguration } from '@/lib/misc'

function createOrGetPersistentStorage() {
  return new Conf<{
    activeRuns: Record<
      string,
      Record<
        string,
        {
          versionRange: string
          dependencyType: (typeof dependencyTypeList)[number]
        } | null
      >
    >
  }>({
    projectName: 'linker-tinker',
    schema: {
      activeRuns: {
        type: 'object',
        additionalProperties: {
          type: ['object', 'null'],
          properties: {
            versionRange: { type: 'string' },
            dependencyType: { type: 'string' },
          },
        },
      },
    },
  })
}

function handleExit(dependentPackageName: string) {
  resetActiveRunsForPackage(dependentPackageName)
  debugConsole.log(
    `Emergency reset of configuration for ${dependentPackageName}`,
  )
}

function getAllActiveRuns() {
  const storage = createOrGetPersistentStorage()
  return storage.get('activeRuns')
}

export function getActiveRunsForPackage(dependencyPackage: string) {
  const activeRuns = getAllActiveRuns()
  return activeRuns[dependencyPackage]
}

export function resetActiveRunsForPackage(dependencyPackage: string) {
  const activeRuns = getAllActiveRuns()
  const storage = createOrGetPersistentStorage()
  storage.set('activeRuns', omit(activeRuns, dependencyPackage))
}

export function resetActiveRunForPackage(
  dependencyPackage: string,
  targetPath: string,
) {
  const activeRuns = getAllActiveRuns()
  const storage = createOrGetPersistentStorage()

  const config = activeRuns[dependencyPackage]?.[targetPath]
  if (config === undefined) {
    return
  }

  storage.set('activeRuns', {
    ...activeRuns,
    [dependencyPackage]: omit(activeRuns[dependencyPackage], targetPath),
  })
}

export function registerNewActiveRun(
  context: RequiredContext<'dependentPackageName' | 'onlyAttach'>,
): void {
  const storage = createOrGetPersistentStorage()
  const runs = storage.get('activeRuns', {})
  if (runs.hasOwnProperty(context.dependentPackageName)) {
    context.onlyAttach = true
  } else {
    storage.set('activeRuns', {
      ...runs,
      [context.dependentPackageName]: {},
    })

    eventBus.on('exitImmediately', () => {
      handleExit(context.dependentPackageName)
    })
  }
}

export async function attachActiveRun({
  dependentPackageName,
  targetPackagePath,
}: RequiredContext<
  'dependentPackageName' | 'targetPackagePath'
>): Promise<void> {
  const storage = createOrGetPersistentStorage()

  const packageConfig = await getInstalledPackageConfiguration(
    dependentPackageName,
    targetPackagePath,
  )

  storage.set(
    'activeRuns',
    merge(storage.get('activeRuns'), {
      [dependentPackageName]: {
        [targetPackagePath]: packageConfig ?? null,
      },
    }),
  )
}
