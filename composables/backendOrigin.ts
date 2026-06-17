export const DEFAULT_SANDBOX_BACKEND_PORT = '8787'
export const LEGACY_BACKEND_ORIGIN = 'http://localhost:8000'
export const FALLBACK_BACKEND_ORIGIN = `http://localhost:${DEFAULT_SANDBOX_BACKEND_PORT}`

export interface BackendLocationLike {
  protocol?: string
  hostname?: string
}

function runtimeLocation(): BackendLocationLike | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }
  return window.location
}

function normalizeProtocol(protocol?: string): string {
  return protocol === 'https:' ? 'https:' : 'http:'
}

function formatHostnameForOrigin(hostname: string): string {
  const normalized = hostname.trim()
  if (normalized.includes(':') && !normalized.startsWith('[')) {
    return `[${normalized}]`
  }
  return normalized
}

function stripTrailingSlash(origin: string): string {
  return origin.trim().replace(/\/+$/, '')
}

function parseOrigin(origin: string): URL | null {
  try {
    return new URL(origin)
  } catch {
    return null
  }
}

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  return (
    normalized === 'localhost'
    || normalized === '::1'
    || normalized === '0:0:0:0:0:0:0:1'
    || normalized === '127.0.0.1'
    || normalized.startsWith('127.')
  )
}

export function resolveDefaultBackendOrigin(locationLike: BackendLocationLike | undefined = runtimeLocation()): string {
  const hostname = locationLike?.hostname?.trim() || 'localhost'
  return `${normalizeProtocol(locationLike?.protocol)}//${formatHostnameForOrigin(hostname)}:${DEFAULT_SANDBOX_BACKEND_PORT}`
}

export function normalizeBackendOriginForRuntime(
  origin: string | undefined,
  defaultOrigin = resolveDefaultBackendOrigin()
): string {
  const value = stripTrailingSlash(origin ?? '')
  if (!value || value === LEGACY_BACKEND_ORIGIN) {
    return defaultOrigin
  }

  const parsedValue = parseOrigin(value)
  const parsedDefault = parseOrigin(defaultOrigin)
  if (
    parsedValue
    && parsedDefault
    && isLoopbackHostname(parsedValue.hostname)
    && !isLoopbackHostname(parsedDefault.hostname)
  ) {
    return defaultOrigin
  }

  return value
}
