let debug = false
export function enableDebug(): void {
  debug = true
}

export const debugConsole = new Proxy(console, {
  get(...outerArguments) {
    return (...parameters: unknown[]) => {
      if (!debug) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,consistent-return
      return Reflect.get(...outerArguments)(...parameters)
    }
  },
})
