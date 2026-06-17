import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeBackendOriginForRuntime,
  resolveDefaultBackendOrigin
} from '../composables/backendOrigin.ts'

test('resolveDefaultBackendOrigin uses the page hostname with the sandbox port', () => {
  assert.equal(
    resolveDefaultBackendOrigin({ protocol: 'http:', hostname: '192.168.1.15' }),
    'http://192.168.1.15:8787'
  )
})

test('normalizeBackendOriginForRuntime migrates the old localhost:8000 default', () => {
  assert.equal(
    normalizeBackendOriginForRuntime(
      'http://localhost:8000',
      'http://192.168.1.15:8787'
    ),
    'http://192.168.1.15:8787'
  )
})

test('normalizeBackendOriginForRuntime replaces stale loopback origins away from localhost', () => {
  assert.equal(
    normalizeBackendOriginForRuntime(
      'http://localhost:8787',
      'http://192.168.1.15:8787'
    ),
    'http://192.168.1.15:8787'
  )
})

test('normalizeBackendOriginForRuntime preserves explicit non-loopback origins', () => {
  assert.equal(
    normalizeBackendOriginForRuntime(
      'http://192.168.1.20:8787',
      'http://192.168.1.15:8787'
    ),
    'http://192.168.1.20:8787'
  )
})

test('normalizeBackendOriginForRuntime keeps localhost when the page is also local', () => {
  assert.equal(
    normalizeBackendOriginForRuntime(
      'http://localhost:8787',
      'http://localhost:8787'
    ),
    'http://localhost:8787'
  )
})
