/**
 * Pages migrées depuis le site actuel (générées par npm run migrate:build dans public/archive/).
 * - index.json : la liste (quelques dizaines de Ko), chargée une fois ;
 * - pages/<slug>.json : le contenu d'une page, chargé seulement quand on l'affiche.
 * Sans migration (fichiers absents), tout renvoie « rien » et les pages affichent leur état par défaut.
 */
import { ref, watchEffect, type Ref } from 'vue'
import type { ArchiveEntry, ArchivePage } from './types'

const BASE = `${import.meta.env.BASE_URL}archive/`
const SLUG = /^[a-z0-9-]+$/

let indexCache: Promise<ArchiveEntry[]> | null = null
const pageCache = new Map<string, Promise<ArchivePage | undefined>>()

async function getJson<T>(url: string): Promise<T | undefined> {
  try {
    const res = await fetch(url)
    return res.ok ? ((await res.json()) as T) : undefined
  } catch {
    return undefined
  }
}

export function loadArchiveIndex(): Promise<ArchiveEntry[]> {
  indexCache ??= getJson<ArchiveEntry[]>(`${BASE}index.json`).then((list) => (Array.isArray(list) ? list : []))
  return indexCache
}

export function findArchivePage(slug: string): Promise<ArchivePage | undefined> {
  if (!SLUG.test(slug)) return Promise.resolve(undefined)
  if (!pageCache.has(slug)) pageCache.set(slug, getJson<ArchivePage>(`${BASE}pages/${slug}.json`))
  return pageCache.get(slug)!
}

/** Page migrée rattachée à une page du nouveau site (groupe, lieu, page d'information) */
export async function archiveFor(kind: 'group' | 'place' | 'info', slug: string): Promise<ArchivePage | undefined> {
  const entry = (await loadArchiveIndex()).find((p) => p.target?.kind === kind && p.target.slug === slug)
  return entry ? findArchivePage(entry.slug) : undefined
}

/** Version réactive pour les pages : se met à jour quand le slug change. */
export function useArchiveFor(kind: 'group' | 'place' | 'info', slug: () => string): Ref<ArchivePage | null> {
  const page = ref<ArchivePage | null>(null)
  watchEffect(async () => {
    const current = slug()
    const found = await archiveFor(kind, current)
    if (slug() === current) page.value = found ?? null
  })
  return page
}

/** Vide les caches (tests) */
export function resetArchiveCache() {
  indexCache = null
  pageCache.clear()
}

type HomeKind = 'group' | 'place' | 'info'

/** Pages migrées rangées dans une rubrique du site (section « More about … »), par ordre alphabétique */
export async function pagesHomedAt(kind: HomeKind, slug: string): Promise<ArchiveEntry[]> {
  return (await loadArchiveIndex())
    .filter((p) => !p.listing && p.home?.kind === kind && 'slug' in p.home && p.home.slug === slug)
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Articles de news migrés, du plus récent au plus ancien */
export async function newsEntries(): Promise<ArchiveEntry[]> {
  return (await loadArchiveIndex()).filter((p) => !p.listing && p.home?.kind === 'news').sort((a, b) => b.order - a.order)
}

/** Version réactive de pagesHomedAt */
export function useHomedPages(kind: HomeKind, slug: () => string): Ref<ArchiveEntry[]> {
  const list = ref<ArchiveEntry[]>([])
  watchEffect(async () => {
    const current = slug()
    const found = await pagesHomedAt(kind, current)
    if (slug() === current) list.value = found
  })
  return list
}

/** Autres pages de la même rubrique (les news : les plus proches dans le temps), pour la colonne latérale */
export async function siblingsOf(page: ArchiveEntry, limit = 5): Promise<ArchiveEntry[]> {
  const home = page.home
  if (!home) return []
  const same = (await loadArchiveIndex()).filter(
    (p) =>
      p.slug !== page.slug &&
      !p.listing &&
      p.home?.kind === home.kind &&
      (home.kind === 'news' || ('slug' in p.home && 'slug' in home && p.home.slug === home.slug)),
  )
  if (home.kind === 'news') {
    return same.sort((a, b) => Math.abs(a.order - page.order) - Math.abs(b.order - page.order)).slice(0, limit)
  }
  return same.sort((a, b) => a.title.localeCompare(b.title)).slice(0, limit)
}
