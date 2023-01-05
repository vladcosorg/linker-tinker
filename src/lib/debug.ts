let debug = false
export function enableDebug() {
  debug = true
}

export const debugConsole = new Proxy(console, {
  get(...outerArguments) {
    return (...parameters: unknown[]) => {
      if (debug) {
        return Reflect.get(...outerArguments)(...parameters)
      }
    }
  },
})
