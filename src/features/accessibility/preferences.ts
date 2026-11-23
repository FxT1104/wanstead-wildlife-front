/**
 * Préférences de lecture (profil d'accessibilité, Must du CDC).
 * Logique pure, sans dépendance au DOM ni au stockage : facile à tester.
 * Reprise de public/core.mjs du prototype.
 */

export type TextScale = 100 | 115 | 130
export type Contrast = 'standard' | 'high'
export type Palette = 'natural' | 'neutral'

export interface ReadingPreferences {
  scale: TextScale
  contrast: Contrast
  colours: Palette
  /** Interligne et espacement augmentés */
  spacing: boolean
  /** Police simple pour les titres */
  font: boolean
  /** Réduction des animations */
  motion: boolean
}

export const DEFAULT_PREFERENCES: Readonly<ReadingPreferences> = Object.freeze({
  scale: 100,
  contrast: 'standard',
  colours: 'natural',
  spacing: false,
  font: false,
  motion: false,
})

const SCALES: readonly TextScale[] = [100, 115, 130]

/** Valide une valeur inconnue (ex. lue depuis le localStorage) et retombe sur les valeurs par défaut. */
export function cleanPreferences(value: unknown): ReadingPreferences {
  const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const scale = Number(v.scale)
  return {
    scale: (SCALES as readonly number[]).includes(scale) ? (scale as TextScale) : 100,
    contrast: v.contrast === 'high' ? 'high' : 'standard',
    colours: v.colours === 'neutral' ? 'neutral' : 'natural',
    spacing: v.spacing === true,
    font: v.font === true,
    motion: v.motion === true,
  }
}

/** Applique les préférences sur <html> : les feuilles de style du prototype s'appuient sur ces attributs/classes. */
export function applyPreferences(prefs: ReadingPreferences, root: HTMLElement = document.documentElement): void {
  root.style.fontSize = `${prefs.scale}%`
  root.dataset.contrast = prefs.contrast
  root.dataset.colours = prefs.colours
  root.classList.toggle('reading-space', prefs.spacing)
  root.classList.toggle('simple-headings', prefs.font)
  root.classList.toggle('reduce-motion', prefs.motion)
}
