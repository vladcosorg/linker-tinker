import process from 'node:process'

import { Args } from '@oclif/core'

export function getInputArgs() {
  return {
    from: Args.string({
      description: 'Path to a package that you want to link',
      required: true,
    }),
    to: Args.string({
      description: `Target package. If not specified, it will use the current cwd`,
      required: false,
      default: process.cwd(),
    }),
  }
}
