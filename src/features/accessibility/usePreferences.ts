import { readonly, ref } from 'vue'
import {
  applyPreferences,
  cleanPreferences,
  DEFAULT_PREFERENCES,
  type ReadingPreferences,
} from './preferences'

export const STORAGE_KEY = 'ww:preferences'

function load(): ReadingPreferences {
  try {
    return cleanPreferences(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'))
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

function save(prefs: ReadingPreferences): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    return true
  } catch {
    return false
  }
}

// État partagé (singleton) : un seul profil par navigateur.
const preferences = ref<ReadingPreferences>(load())
const status = ref('')

/**
 * Profil d'accessibilité stocké dans ce navigateur.
 * TODO : synchroniser avec le compte utilisateur quand l'API le proposera.
 */
export function usePreferences() {
  function update(patch: Partial<ReadingPreferences>) {
    preferences.value = cleanPreferences({ ...preferences.value, ...patch })
    applyPreferences(preferences.value)
    status.value = save(preferences.value)
      ? 'Preferences saved on this browser.'
      : 'Preferences applied for this page. Browser storage is unavailable.'
  }

  function reset() {
    preferences.value = { ...DEFAULT_PREFERENCES }
    applyPreferences(preferences.value)
    status.value = save(preferences.value)
      ? 'Preferences reset.'
      : 'Preferences reset for this page. Browser storage is unavailable.'
  }

  /** À appeler une fois au démarrage, avant le premier rendu, pour éviter un flash. */
  function init() {
    preferences.value = load()
    applyPreferences(preferences.value)
  }

  return { preferences: readonly(preferences), status: readonly(status), update, reset, init }
}
