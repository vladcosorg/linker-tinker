import jetpack from 'fs-jetpack'
import { FSJetpack } from 'fs-jetpack/types'

export function getTestTemporaryDirectory(): FSJetpack {
  return jetpack.tmpDir()
}
