import { exec } from 'promisify-child-process'

import type { ChildProcessPromise } from 'promisify-child-process'

export async function execNpm(
  command: string,
  {
    options = [],
    cwd,
  }: {
    options?: Array<string | [string, string]>
    cwd?: string
  },
): Promise<ChildProcessPromise> {
  const compiledOptions = options
    .map((item) =>
      Array.isArray(item) ? `--${item[0]} ${item[1]}` : `--${item}`,
    )
    .join(' ')
  const compiledCommand = `npm ${compiledOptions}  ${command} `
  // console.log(compiledCommand)
  return exec(compiledCommand, { cwd })
}
