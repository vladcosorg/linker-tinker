import { Listr } from 'listr2'
import { expect, test } from 'vitest'

import { checkIfThePathExistsTask } from '../../../src/lib/tasks/sync/check-if-the-path-exists-task'
import { getFsHelpers } from '../../unit/helpers'

const { createPackage, temporaryCwd } = getFsHelpers()

async function runTask(
  ...parameters: Parameters<typeof checkIfThePathExistsTask>
) {
  return new Listr([checkIfThePathExistsTask(...parameters)]).run()
}

test('Is should run sucessfully if the path exists', async () => {
  const randomPackage = createPackage()
  await runTask(randomPackage.cwd.path())
})

test('Is should fail if the path is a not a directory', async () => {
  const fileName = 'not-a-dir'
  const filePath = temporaryCwd.path(fileName)
  await temporaryCwd.fileAsync(fileName)

  await expect(runTask(filePath)).rejects.toThrow()
})

test('Is should fail if the does not exist', async () => {
  await expect(
    runTask(temporaryCwd.path('non-existing-path')),
  ).rejects.toThrow()
})
