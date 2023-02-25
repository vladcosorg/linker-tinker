import jetpack from 'fs-jetpack'
import { Listr } from 'listr2'
import { it, vi, afterEach, expect } from 'vitest'

import type { Context } from '@/lib/context'

import { eventBus } from '../../../src/lib/event-emitter'
import { getActiveRunsForPackage } from '../../../src/lib/persistent-storage'
import { symlinkTask } from '../../../src/lib/tasks/sync/create-symlink'
import { installDependentPackageTask } from '../../../src/lib/tasks/sync/install-dependent-package-task'
import { watchSymlinkReset } from '../../../src/lib/tasks/watch/watch-symlink-reset'
import { getFsHelpers } from '../../unit/helpers'
import { delay, waitUntiltoHaveBeenCalledWith } from '../../util'

const spy = vi.spyOn(console, 'log')
vi.mock('../../../src/lib/persistent-storage', () => ({
  getActiveRunsForPackage: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

const { createPackage, temporaryCwd } = getFsHelpers()
it('it should automatically reinstall a missing symlink', async () => {
  const secondary = createPackage({
    files: {
      'package.json': {
        name: 'secondary',
      },
    },
  })

  const primaryPackage = createPackage({
    files: {
      'package.json': {
        name: 'master',
      },
    },
  })

  vi.mocked(getActiveRunsForPackage).mockReturnValue({
    [primaryPackage.cwd.path()]: null,
  })

  const subcontext = {
    noSymlink: false,
    dependentPackageName: 'secondary',
    targetPackagePath: primaryPackage.cwd.path(),
    isExiting: false,
    intermediateCacheDirectory: temporaryCwd.path(),
  } satisfies Partial<Context>

  const config = {
    concurrent: false,
  }

  await new Listr(
    [installDependentPackageTask(), symlinkTask(subcontext)],
    config,
  ).run()

  expect(
    jetpack.inspect(primaryPackage.cwd.path('node_modules', 'secondary')).type,
  ).toBe('symlink')
  // console.log('is symlink')

  const list = new Listr([watchSymlinkReset()], config).run()

  await waitUntiltoHaveBeenCalledWith(spy, ['[STARTED] Watching symlink reset'])
  // console.log('aaa')
  // await execa('npm', ['install', 'prettier'], {
  //   cwd: primaryPackage.cwd.path(),
  //   all: true,
  // })
  // await execa('npm', ['uninstall', 'prettier'], {
  //   cwd: primaryPackage.cwd.path(),
  //   all: true,
  // })
  // expect(
  //   jetpack.inspect(primaryPackage.cwd.path('node_modules', 'secondary')).type,
  // ).toBe('symlink')
  console.log(
    primaryPackage.cwd.path('node_modules', 'secondary'),
    jetpack.inspect(primaryPackage.cwd.path('node_modules', 'secondary')),
  )
  console.log('replacing symlink with dir')
  await jetpack.removeAsync(
    primaryPackage.cwd.path('node_modules', 'secondary'),
  )
  await jetpack.dirAsync(primaryPackage.cwd.path('node_modules', 'secondary'))
  await delay(500)
  await new Listr([symlinkTask(subcontext)], config).run()
  console.log('restored symlink')
  console.log(
    primaryPackage.cwd.path('node_modules', 'secondary'),
    jetpack.inspect(primaryPackage.cwd.path('node_modules', 'secondary')),
  )
  // expect(
  //   jetpack.inspect(primaryPackage.cwd.path('node_modules', 'secondary')).type,
  // ).toBe('symlink')
  await waitUntiltoHaveBeenCalledWith(spy, ['change detected'])
  eventBus.emit('exit')
  await list
  console.log('ready')
})
