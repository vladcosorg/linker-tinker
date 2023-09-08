import Conf from 'conf'
import _ from 'lodash'

import { debugConsole } from '@/lib/debug'
import { eventBus } from '@/lib/event-emitter'
import type { dependencyTypes as dependencyTypeList } from '@/lib/misc'
import { getInstalledPackageConfiguration } from '@/lib/misc'
import type { PickContext } from '@/lib/tasks'

let singletonStorage: ReturnType<typeof createPersistentStorage>
export function createPersistentStorage(cwd?: string) {
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
    cwd,
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

export function reloadPersistentStorage() {
  singletonStorage = createPersistentStorage()
}

export function createOrGetPersistentStorage(cwd?: string) {
  if (!singletonStorage) {
    singletonStorage = createPersistentStorage(cwd)
  }

  return singletonStorage
}

function handleExit(dependentPackageName: string) {
  resetActiveRunsForPackage(dependentPackageName)
  debugConsole.log(
    `Emergency reset of configuration for ${dependentPackageName}`,
  )
}

function getAllActiveRuns() {
  const storage = createOrGetPersistentStorage()
  return storage.get('activeRuns', {})
}

export function getActiveRunsForPackage(dependencyPackage: string) {
  const activeRuns = getAllActiveRuns()
  return activeRuns[dependencyPackage]
}

export function resetActiveRunsForPackage(dependencyPackage: string) {
  const activeRuns = getAllActiveRuns()
  const storage = createOrGetPersistentStorage()
  storage.set('activeRuns', _.omit(activeRuns, dependencyPackage))
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
    [dependencyPackage]: _.omit(activeRuns[dependencyPackage], targetPath),
  })
}

export function registerNewActiveRun(
  context: PickContext<
    'dependentPackageName' | 'foregroundWatcher' | 'onlyAttach'
  >,
): void {
  const storage = createOrGetPersistentStorage()

  const runs = getAllActiveRuns()
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
}: PickContext<'dependentPackageName' | 'targetPackagePath'>): Promise<void> {
  const storage = createOrGetPersistentStorage()

  let packageConfig = await getInstalledPackageConfiguration(
    dependentPackageName,
    targetPackagePath,
  )

  if (
    typeof packageConfig?.versionRange === 'string' &&
    packageConfig.versionRange.startsWith('file:')
  ) {
    packageConfig = undefined
  }

  storage.set(
    'activeRuns',
    _.merge(storage.get('activeRuns'), {
      [dependentPackageName]: {
        [targetPackagePath]: packageConfig ?? null,
      },
    }),
  )
}
