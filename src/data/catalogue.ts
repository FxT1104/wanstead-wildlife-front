/**
 * Données statiques temporaires, reprises du prototype.
 * À remplacer par des appels à l'API quand les entités Species / Place existeront côté back.
 */

export interface WildlifeGroup {
  slug: string
  name: string
  /** Exemple d'espèce illustrée, affiché sous le nom */
  example: string
  /** Gabarit de fiche : la flore a en plus une section « Flowering & fruiting » */
  profile: 'species' | 'flora'
}

export interface Place {
  slug: string
  name: string
}

export const wildlifeGroups: WildlifeGroup[] = [
  { slug: 'microscopic-organisms', name: 'Microscopic Organisms', example: 'A paramecium', profile: 'species' },
  { slug: 'algae', name: 'Algae', example: 'Filamentous green algae', profile: 'flora' },
  { slug: 'lichens', name: 'Lichens', example: 'Lichen on a twig', profile: 'flora' },
  { slug: 'slime-moulds', name: 'Slime Moulds', example: 'Yellow slime mould', profile: 'species' },
  { slug: 'fungi', name: 'Fungi', example: 'Woodland mushrooms', profile: 'species' },
  { slug: 'liverworts-mosses', name: 'Liverworts, Mosses', example: 'Moss with spore capsules', profile: 'flora' },
  { slug: 'plants', name: 'Plants', example: 'Bluebells', profile: 'flora' },
  { slug: 'millipedes-and-centipedes', name: 'Millipedes and Centipedes', example: 'A millipede', profile: 'species' },
  { slug: 'molluscs-crustaceans', name: 'Molluscs, Crustaceans', example: 'A garden snail', profile: 'species' },
  { slug: 'spiders', name: 'Spiders', example: 'An orb-weaver spider', profile: 'species' },
  { slug: 'plant-galls', name: 'Plant Galls', example: 'Galls on an oak leaf', profile: 'species' },
  { slug: 'insects', name: 'Insects', example: 'A dragonfly', profile: 'species' },
  { slug: 'fish-amphibians-reptiles', name: 'Fish, Amphibians, Reptiles', example: 'A common frog', profile: 'species' },
  { slug: 'birds', name: 'Birds', example: 'A robin', profile: 'species' },
  { slug: 'mammals', name: 'Mammals', example: 'A red fox', profile: 'species' },
]

export const places: Place[] = [
  { slug: 'alders-brook', name: 'Alders Brook' },
  { slug: 'bush-wood', name: 'Bush Wood' },
  { slug: 'city-of-london-cemetery', name: 'City of London Cemetery' },
  { slug: 'gilberts-slade', name: "Gilbert's Slade" },
  { slug: 'leyton-flats', name: 'Leyton Flats' },
  { slug: 'sewage-works-site', name: 'Sewage Works site' },
  { slug: 'wanstead-flats', name: 'Wanstead Flats' },
  { slug: 'wanstead-park', name: 'Wanstead Park' },
  { slug: 'other-locations', name: 'Other Locations' },
]

/** Recherche insensible à la casse et aux accents (reprise de normalise() du prototype). */
export function normalise(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function filterGroups(groups: WildlifeGroup[], query: string): WildlifeGroup[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean)
  return groups.filter((g) => {
    const haystack = normalise(`${g.name} ${g.example}`)
    return terms.every((t) => haystack.includes(t))
  })
}
