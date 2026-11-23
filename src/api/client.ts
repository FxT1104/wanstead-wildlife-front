/**
 * Client HTTP minimal pour l'API Symfony.
 * - préfixe les URL avec VITE_API_BASE_URL (/api par défaut, relayé par le proxy Vite en dev)
 * - ajoute le jeton JWT (header Authorization: Bearer)
 * - utilise les bons Content-Type d'API Platform (JSON-LD, merge-patch pour PATCH)
 * - transforme les erreurs en ApiError avec les violations de validation
 */

const TOKEN_KEY = 'ww:token'
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export interface Violation {
  propertyPath: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly violations: Violation[]

  constructor(status: number, message: string, violations: Violation[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.violations = violations
  }
}

// --- Jeton JWT -------------------------------------------------------------
// Stocké en sessionStorage : il disparaît à la fermeture de l'onglet.
let token: string | null = readToken()

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return token
}

type TokenListener = (token: string | null) => void
const listeners = new Set<TokenListener>()

/** Prévient quand le jeton change (connexion, déconnexion, expiration détectée par un 401). */
export function onTokenChange(listener: TokenListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setToken(value: string | null): void {
  token = value
  listeners.forEach((l) => l(value))
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // stockage indisponible : le jeton reste en mémoire pour cette page
  }
}

// --- Requêtes ---------------------------------------------------------------
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  /** Les tableaux sont répétés : { 'category[]': ['a', 'b'] } → category[]=a&category[]=b */
  query?: Record<string, string | number | boolean | string[] | undefined>
  body?: unknown
  signal?: AbortSignal
  /** Remplace le Content-Type par défaut (JSON-LD / merge-patch) */
  contentType?: string
}

export function buildUrl(path: string, query?: RequestOptions['query']): string {
  // Accepte "/articles" comme une IRI complète "/api/articles/1".
  const full = path.startsWith(BASE_URL + '/') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query ?? {})) {
    if (Array.isArray(v)) v.forEach((item) => params.append(k, item))
    else if (v !== undefined) params.append(k, String(v))
  }
  const qs = params.toString()
  return qs ? `${full}?${qs}` : full
}

export async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/ld+json' }
  const isForm = options.body instanceof FormData
  // FormData (envoi de fichiers) : le navigateur pose lui-même le Content-Type multipart avec sa frontière.
  if (options.body !== undefined && !isForm) {
    headers['Content-Type'] =
      options.contentType ?? (method === 'PATCH' ? 'application/merge-patch+json' : 'application/ld+json')
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'The server could not be reached. Please check your connection and try again.')
  }

  if (response.status === 401) setToken(null)

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/**
 * Messages lisibles pour les codes dont le corps n'est pas exploitable
 * (413 : page HTML du serveur web ; 429 : limite de débit de l'API, voir API.md § 10).
 */
const FRIENDLY_MESSAGES: Record<number, string> = {
  413: 'The photo must be 5 MB or less.',
  429: 'Too many attempts. Please wait a little and try again.',
}

async function toApiError(response: Response): Promise<ApiError> {
  let data: Record<string, unknown> = {}
  try {
    data = (await response.json()) as Record<string, unknown>
  } catch {
    // corps vide ou non JSON
  }
  const message =
    FRIENDLY_MESSAGES[response.status] ??
    (data.detail as string | undefined) ??
    (data.message as string | undefined) ?? // erreurs Lexik JWT
    (data.description as string | undefined) ??
    `Request failed (${response.status})`
  const violations = Array.isArray(data.violations) ? (data.violations as Violation[]) : []
  return new ApiError(response.status, message, violations)
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
  delete: (path: string, options?: RequestOptions) => request<void>('DELETE', path, options),
}
