import type { Species } from './types'

/**
 * Fiches espèces migrées depuis le site actuel.
 * Vide tant que la migration (tâche 3.5) n'a pas commencé : voir docs/content-migration.md.
 *
 * Exemple de fiche :
 * {
 *   slug: 'grey-heron',
 *   group: 'birds',
 *   commonName: 'Grey Heron',
 *   scientificName: 'Ardea cinerea',
 *   family: 'Ardeidae',
 *   season: 'All year',
 *   intro: ['Premier paragraphe…', 'Deuxième paragraphe…'],
 *   photos: [{ src: '/photos/species/grey-heron.webp', alt: 'A grey heron standing in shallow water' }],
 *   records: [{ date: '1987', location: 'wanstead-park', observation: '…', observer: 'PF' }],
 *   places: ['wanstead-park'],
 * }
 */
export const species: Species[] = []
