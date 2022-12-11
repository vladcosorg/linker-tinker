import * as child_process from 'node:child_process'
import * as util from 'node:util'

const execAsync = util.promisify(child_process.exec)

export async function execNpm(
  command: string,
  {
    options = [],
    cwd,
  }: {
    options?: Array<string | [string, string]>
    cwd?: string
  },
): Promise<string> {
  const compiledOptions = options
    .map((item) =>
      Array.isArray(item) ? `--${item[0]} ${item[1]}` : `--${item}`,
    )
    .join(' ')
  const compiledCommand = `npm ${compiledOptions}  ${command} `
  // console.log(compiledCommand)
  const output = await execAsync(compiledCommand, { cwd })
  return output.stdout
}
