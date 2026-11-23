import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, buildUrl, getToken, setToken } from './client'

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/ld+json' },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('buildUrl', () => {
  it('prefixes paths with /api and keeps full IRIs as they are', () => {
    expect(buildUrl('/articles')).toBe('/api/articles')
    expect(buildUrl('/api/articles/3')).toBe('/api/articles/3')
  })

  it('adds defined query parameters only', () => {
    expect(buildUrl('/articles', { page: 2, category: undefined })).toBe('/api/articles?page=2')
  })
})

describe('request', () => {
  beforeEach(() => setToken(null))
  afterEach(() => vi.unstubAllGlobals())

  it('sends the JWT and JSON-LD headers', async () => {
    const fetchMock = mockFetch(200, { member: [], totalItems: 0 })
    setToken('abc')

    await api.get('/articles')

    const [, init] = fetchMock.mock.calls[0]!
    expect(init.headers).toMatchObject({ Accept: 'application/ld+json', Authorization: 'Bearer abc' })
  })

  it('uses merge-patch for PATCH requests', async () => {
    const fetchMock = mockFetch(200, {})
    await api.patch('/articles/1', { title: 'New' })
    expect(fetchMock.mock.calls[0]![1].headers['Content-Type']).toBe('application/merge-patch+json')
  })

  it('turns validation errors into an ApiError with violations', async () => {
    mockFetch(422, {
      detail: 'title: This value should not be blank.',
      violations: [{ propertyPath: 'title', message: 'This value should not be blank.' }],
    })

    const error = await api.post('/articles', {}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(422)
    expect((error as ApiError).violations[0]!.propertyPath).toBe('title')
  })

  it('forgets the token when the API answers 401', async () => {
    mockFetch(401, { message: 'Expired JWT Token' })
    setToken('expired')

    await expect(api.get('/users/1')).rejects.toThrow('Expired JWT Token')
    expect(getToken()).toBeNull()
  })

  it('reports network failures with a readable message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(api.get('/articles')).rejects.toMatchObject({ status: 0 })
  })
})
