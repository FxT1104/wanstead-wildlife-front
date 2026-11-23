/**
 * Permet à n'importe quelle page d'ouvrir le panneau « Reading preferences »
 * (monté une seule fois dans App.vue).
 */
let opener: (() => void) | null = null

export function registerPreferencesDialog(open: () => void): void {
  opener = open
}

export function openReadingPreferences(): void {
  opener?.()
}
