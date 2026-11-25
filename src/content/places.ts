import type { PlaceContent } from './types'

/**
 * Contenu des pages lieux, migré depuis le site actuel.
 * Une entrée par slug de src/data/catalogue.ts. Un lieu sans entrée affiche sa page
 * avec le seul nom et un message indiquant que le contenu arrive.
 * Voir docs/content-migration.md.
 */
export const placeContent: PlaceContent[] = []
