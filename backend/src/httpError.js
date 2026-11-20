export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function errorKind(error) {
  const name = /^[A-Za-z]+$/.test(error?.name) ? error.name : 'Error'
  const code = error?.code
  return typeof code === 'number' || (typeof code === 'string' && /^[A-Z0-9_]{1,30}$/.test(code))
    ? { name, code }
    : { name }
}
