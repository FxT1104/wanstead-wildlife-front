/**
 * Accès au contenu éditorial. Aujourd'hui : fichiers statiques de src/content/.
 * Plus tard : appels à l'API (Species, Place) — seules ces fonctions changeront.
 */
import { places, wildlifeGroups } from '@/data/catalogue'
import { infoPages } from './info'
import { placeContent } from './places'
import { species } from './species'
import type { InfoPage, PlaceContent, Species } from './types'

export function speciesInGroup(group: string): Species[] {
  return species.filter((s) => s.group === group).sort((a, b) => a.commonName.localeCompare(b.commonName))
}

export function findSpecies(group: string, slug: string): Species | undefined {
  return species.find((s) => s.group === group && s.slug === slug)
}

export function speciesAtPlace(place: string): Species[] {
  return species.filter((s) => s.places?.includes(place)).sort((a, b) => a.commonName.localeCompare(b.commonName))
}

export function findPlaceContent(slug: string): PlaceContent | undefined {
  return placeContent.find((p) => p.slug === slug)
}

export function findInfoPage(slug: string): InfoPage | undefined {
  return infoPages.find((p) => p.slug === slug)
}

/** Nom affichable d'un lieu à partir de son slug (ou le texte tel quel) */
export function placeLabel(value: string): string {
  return places.find((p) => p.slug === value)?.name ?? value
}

export function groupOf(slug: string) {
  return wildlifeGroups.find((g) => g.slug === slug)
}

export { infoPages, species }
