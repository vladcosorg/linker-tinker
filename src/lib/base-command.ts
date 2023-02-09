import { Command, Flags } from '@oclif/core'

import type { AllContextOptions } from '@/lib/context'
import { enableDebug } from '@/lib/debug'

import type { Interfaces } from '@oclif/core'
import type { ListrRendererValue } from 'listr2'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)['baseFlags'] & T['flags']
>
// eslint-disable-next-line unicorn/prevent-abbreviations
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // define flags that can be inherited by any command that extends BaseCommand
  static override baseFlags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Display a verbose action list',
      default: false,
    }),
    debug: Flags.boolean({
      char: 'd',
      default: false,
      description:
        'Enables the verbose mode and displays additional debug info that may help you',
    }),
  }

  protected flags!: Flags<T>
  protected args!: Args<T>

  public override async init(): Promise<void> {
    await super.init()

    console.log(super.ctor.baseFlags)
    const { args, flags } = await this.parse({
      flags: {
        ...this.ctor.flags,
        ...super.ctor.baseFlags,
      },
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    this.args = args as Args<T>

    if (this.flags.debug) {
      enableDebug()
    }
  }

  protected getRendererType(): ListrRendererValue {
    return this.flags.verbose || this.flags.debug ? 'simple' : 'default'
  }

  protected createContext<O extends Partial<AllContextOptions>>(context: O) {
    return {
      debug: this.flags.debug,
      isExiting: false,
      ...context,
    }
  }
}
