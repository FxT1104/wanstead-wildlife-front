import type { RouteLocationRaw } from 'vue-router'
import { normalise, places, wildlifeGroups } from '@/data/catalogue'
import { infoPages, species } from '@/content'
import type { ArchiveEntry } from '@/content/types'

export type SearchKind = 'wildlife' | 'places' | 'information'

export interface SearchItem {
  title: string
  kind: SearchKind
  to: RouteLocationRaw
  /** Mots-clés supplémentaires (synonymes, exemples) */
  keywords: string
  description: string
}

const informationPages: SearchItem[] = [
  {
    title: 'About Wanstead Wildlife',
    kind: 'information',
    to: { name: 'about' },
    keywords: 'about paul ferris author history study area',
    description: 'The story behind the website and the study area.',
  },
  {
    title: 'Community journal',
    kind: 'information',
    to: { name: 'community' },
    keywords: 'community journal field notes articles sightings write publish',
    description: 'Field notes from people exploring Wanstead.',
  },
  {
    title: 'Accessibility information',
    kind: 'information',
    to: { name: 'accessibility' },
    keywords: 'accessibility text size contrast keyboard screen reader',
    description: 'Reading preferences, keyboard access and how to report a problem.',
  },
  {
    title: 'Help and contact',
    kind: 'information',
    to: { name: 'help' },
    keywords: 'help contact support question report error correction',
    description: 'Ask a question or report a problem.',
  },
  {
    title: 'Your data',
    kind: 'information',
    to: { name: 'privacy' },
    keywords: 'privacy data gdpr delete export account',
    description: 'What we keep about you and how to delete it.',
  },
]

export const searchCatalogue: SearchItem[] = [
  ...wildlifeGroups.map<SearchItem>((g) => ({
    title: g.name,
    kind: 'wildlife',
    to: { name: 'wildlife-group', params: { group: g.slug } },
    keywords: `${g.example} ${g.slug.replace(/-/g, ' ')}`,
    description: `Wildlife group · Example: ${g.example}`,
  })),
  ...places.map<SearchItem>((p) => ({
    title: p.name,
    kind: 'places',
    to: { name: 'place', params: { place: p.slug } },
    keywords: 'place site walk',
    description: 'Wildlife site in and around Wanstead',
  })),
  ...species.map<SearchItem>((s) => ({
    title: s.commonName,
    kind: 'wildlife',
    to: { name: 'species', params: { group: s.group, species: s.slug } },
    keywords: `${s.scientificName ?? ''} ${s.family ?? ''}`,
    description: [s.scientificName, wildlifeGroups.find((g) => g.slug === s.group)?.name].filter(Boolean).join(' · '),
  })),
  ...informationPages,
  ...infoPages.map<SearchItem>((p) => ({
    title: p.title,
    kind: 'information',
    to: { name: 'info', params: { page: p.slug } },
    keywords: 'about',
    description: p.summary,
  })),
]

/** Pages migrées (hors pages déjà rattachées au site et pages-listes), pour la recherche */
export function archiveSearchItems(entries: ArchiveEntry[]): SearchItem[] {
  return entries
    .filter((p) => !p.target && !p.listing)
    .map((p) => {
      const home = p.home
      const kind: SearchKind = home?.kind === 'group' ? 'wildlife' : home?.kind === 'place' ? 'places' : 'information'
      const where =
        home?.kind === 'news'
          ? 'News'
          : home?.kind === 'group'
            ? (wildlifeGroups.find((g) => g.slug === home.slug)?.name ?? 'Wildlife')
            : home?.kind === 'place'
              ? (places.find((pl) => pl.slug === home.slug)?.name ?? 'Places')
              : 'From the previous website'
      return {
        title: p.title,
        kind,
        to: { name: 'archive-page', params: { slug: p.slug } },
        keywords: p.section ?? '',
        description: where,
      }
    })
}

/** Tous les mots de la recherche doivent apparaître (sans tenir compte des accents ni de la casse). */
export function search(items: SearchItem[], query: string, kind: SearchKind | 'all' = 'all'): SearchItem[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean)
  return items.filter((item) => {
    if (kind !== 'all' && item.kind !== kind) return false
    const haystack = normalise(`${item.title} ${item.keywords}`)
    return terms.every((t) => haystack.includes(t))
  })
}

export function isSearchKind(value: unknown): value is SearchKind | 'all' {
  return value === 'all' || value === 'wildlife' || value === 'places' || value === 'information'
}
