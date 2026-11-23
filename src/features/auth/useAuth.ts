import { computed, ref } from 'vue'
import { api, getToken, onTokenChange, setToken } from '@/api/client'
import type { Credentials, RegisterInput, User } from '@/api/types'

/** Contenu du jeton émis par LexikJWTAuthenticationBundle */
export interface JwtClaims {
  username: string
  roles: string[]
  exp: number
  iat?: number
}

/** Lit la partie « payload » du JWT (sans la vérifier : c'est le serveur qui la vérifie à chaque requête). */
export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as Partial<JwtClaims>
    if (typeof claims.username !== 'string' || typeof claims.exp !== 'number') return null
    return { username: claims.username, roles: Array.isArray(claims.roles) ? claims.roles : [], exp: claims.exp }
  } catch {
    return null
  }
}

const token = ref<string | null>(getToken())
onTokenChange((value) => (token.value = value))

const claims = computed(() => {
  const c = decodeJwt(token.value)
  return c && c.exp * 1000 > Date.now() ? c : null
})

export function useAuth() {
  const isAuthenticated = computed(() => claims.value !== null)
  const isAdmin = computed(() => claims.value?.roles.includes('ROLE_ADMIN') ?? false)
  const email = computed(() => claims.value?.username ?? null)

  async function login(credentials: Credentials) {
    // /api/login est une route Symfony json_login qui attend du JSON simple.
    const { token: value } = await api.post<{ token: string }>('/login', credentials, {
      contentType: 'application/json',
    })
    setToken(value)
  }

  async function register(input: RegisterInput) {
    await api.post<User>('/register', input)
    await login({ email: input.email, password: input.plainPassword })
  }

  function logout() {
    setToken(null)
  }

  /** Compte de l'utilisateur connecté. Nécessite GET /api/me côté back (voir docs/api-contract.md). */
  const me = () => api.get<User>('/me')

  /** Suppression du compte (UK GDPR). Nécessite DELETE /api/me côté back. */
  async function deleteAccount() {
    await api.delete('/me')
    logout()
  }

  return { isAuthenticated, isAdmin, email, login, register, logout, me, deleteAccount }
}
