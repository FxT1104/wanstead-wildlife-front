/**
 * Articles officiels écrits dans l'espace admin (API /api/articles), affichés dans News.
 * Le back ne renvoie que les articles publiés aux visiteurs ; un admin connecté reçoit aussi les brouillons,
 * on les filtre donc ici pour que News montre la même chose à tout le monde.
 */
import { api } from '@/api/client'
import { categories } from '@/api/endpoints'
import type { Article, Collection } from '@/api/types'

/** Nombre maximum de pages lues (30 articles par page côté API) */
const MAX_PAGES = 10

export type PublishedArticle = Article & { publishedAt: string }

export async function loadPublishedArticles(): Promise<PublishedArticle[]> {
  const all: Article[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await api.get<Collection<Article>>('/articles', { query: { page } })
    all.push(...data.member)
    if (!data.view?.next) break
  }
  return all
    .filter((a): a is PublishedArticle => !!a.publishedAt && Date.parse(a.publishedAt) <= Date.now())
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

/** IRI de catégorie → nom ; vide si l'API ne répond pas (la catégorie est un détail) */
export async function loadCategoryNames(): Promise<Map<string, string>> {
  try {
    return new Map((await categories.list()).member.map((c) => [c['@id'], c.name]))
  } catch {
    return new Map()
  }
}

export type ArticleBlock = { kind: 'heading'; text: string; id: string } | { kind: 'paragraph'; text: string }

/**
 * Texte de l'article en blocs : un paragraphe par ligne vide, « ## » en début de ligne = intertitre.
 * Pas de HTML : le texte est affiché tel quel (aucune injection possible).
 */
export function toBlocks(content: string): ArticleBlock[] {
  const used = new Set<string>()
  return content
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): ArticleBlock => {
      const heading = /^#{2,3}\s+(.+)$/.exec(chunk)
      if (!heading || chunk.includes('\n')) return { kind: 'paragraph', text: chunk }
      const text = heading[1]!.trim()
      let id = `section-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'part'}`
      while (used.has(id)) id += '-2'
      used.add(id)
      return { kind: 'heading', text, id }
    })
}

/** Résumé pour les cartes : le résumé saisi, sinon le début du texte */
export function excerptOf(article: Pick<Article, 'summary' | 'content'>, max = 180): string {
  if (article.summary?.trim()) return article.summary.trim()
  const text = toBlocks(article.content)
    .filter((b) => b.kind === 'paragraph')
    .map((b) => b.text)
    .join(' ')
    .replace(/\s+/g, ' ')
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text
}
