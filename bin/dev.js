#!/usr/bin/env ts-node

/* eslint-disable node/shebang */
// eslint-disable-next-line unicorn/prevent-abbreviations
import path from 'node:path'
import url from 'node:url'

import oclif from '@oclif/core'
// eslint-disable-next-line node/no-unpublished-import
import { register } from 'ts-node'

// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = 'development'

register({
  project: path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '..',
    'tsconfig.json',
  ),
})

// In dev mode, always show stack traces
oclif.settings.debug = true

// Start the CLI
oclif
  .run(process.argv.slice(2), import.meta.url)
  .then(oclif.flush)
  .catch(oclif.Errors.handle)
