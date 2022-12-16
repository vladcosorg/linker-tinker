import jetpack from 'fs-jetpack'

import type { FSJetpack } from 'fs-jetpack/types'

export function getTestTemporaryDirectory(): FSJetpack {
  return jetpack.tmpDir()
}
