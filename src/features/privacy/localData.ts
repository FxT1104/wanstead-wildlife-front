/**
 * Données que le site garde dans ce navigateur (UK GDPR : droit d'accès et d'effacement).
 * Toute nouvelle clé de stockage doit être ajoutée ici.
 */
export const LOCAL_KEYS = [
  { key: 'ww:preferences', storage: 'local', label: 'Reading preferences' },
  { key: 'ww:community', storage: 'local', label: 'Community articles saved on this browser (demo mode)' },
  { key: 'ww:support', storage: 'local', label: 'Help requests saved on this browser (demo mode)' },
  { key: 'ww:my-requests', storage: 'local', label: 'Reference numbers of the help requests you sent' },
  { key: 'ww:token', storage: 'session', label: 'Sign-in session' },
] as const

function store(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? localStorage : sessionStorage
  } catch {
    return null
  }
}

/** Contenu lisible de toutes les données locales, pour l'export JSON. */
export function exportLocalData(): Record<string, unknown> {
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString() }
  for (const { key, storage } of LOCAL_KEYS) {
    if (key === 'ww:token') continue // le jeton de connexion n'est pas une donnée utile à exporter
    const raw = store(storage)?.getItem(key)
    if (raw == null) continue
    try {
      out[key] = JSON.parse(raw)
    } catch {
      out[key] = raw
    }
  }
  return out
}

/** Supprime toutes les données locales. Retourne false si le stockage est inaccessible. */
export function deleteLocalData(): boolean {
  let ok = true
  for (const { key, storage } of LOCAL_KEYS) {
    const s = store(storage)
    if (!s) {
      ok = false
      continue
    }
    s.removeItem(key)
  }
  return ok
}
