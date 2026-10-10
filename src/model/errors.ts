export type ErrorCode =
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'INVALID_PARENT'
  | 'INVALID_STATUS'
  | 'CONFLICT'
  | 'NETWORK_ERROR'

export type AppError = {
  code: ErrorCode
  message: string
}

export type Result<T> = { data: T } | { error: AppError }

export function ok<T>(data: T): Result<T> {
  return { data }
}

export function fail(code: ErrorCode, message: string): Result<never> {
  return { error: { code, message } }
}

export function isOk<T>(result: Result<T>): result is { data: T } {
  return 'data' in result
}

export function isErr<T>(
  result: Result<T>,
): result is { error: AppError } {
  return 'error' in result
}
