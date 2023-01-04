interface ErrorWithMessage {
  message: string
}

export class PrematureExitError extends Error {
  override message =
    'The watcher command returned prematurely. Its script should run continously until cancelled.'
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>)['message'] === 'string'
  )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

// eslint-disable-next-line import/no-unused-modules
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}
