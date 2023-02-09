import { TypedEmitter } from 'tiny-typed-emitter'

interface Events {
  exit: () => Promise<void> | void
  exitImmediately: () => Promise<void> | void
}
export const eventBus = new TypedEmitter<Events>()
