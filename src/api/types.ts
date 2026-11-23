/**
 * Types des ressources exposées par l'API Symfony / API Platform (dépôt wanstead-wildlife-api).
 * Écrits à la main d'après les entités au 13/11/2026 (Article, Category, User).
 * Quand l'API se stabilise, ils peuvent être générés depuis http://localhost:8090/api/docs.json
 * (ex. `npx openapi-typescript`).
 */

/** Champs JSON-LD ajoutés par API Platform à chaque ressource. */
export interface JsonLd {
  '@id': string
  '@type': string
}

/** Collection paginée JSON-LD (API Platform 4+ : clés sans préfixe "hydra:"). */
export interface Collection<T> {
  member: T[]
  totalItems: number
  view?: {
    '@id': string
    first?: string
    last?: string
    next?: string
    previous?: string
  }
}

/** IRI d'une ressource, ex. "/api/categories/3" */
export type Iri = string

export interface Category extends JsonLd {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface Article extends JsonLd {
  id: number
  title: string
  slug: string
  summary: string | null
  content: string
  /** null = brouillon */
  publishedAt: string | null
  createdAt: string
  /** IRI de la catégorie */
  category: Iri
}

export interface ArticleInput {
  title: string
  slug: string
  summary?: string | null
  content: string
  publishedAt?: string | null
  category: Iri
}

export interface User extends JsonLd {
  id: number
  email: string
  displayName: string
  createdAt: string
}

export interface RegisterInput {
  email: string
  plainPassword: string
  displayName: string
}

export interface Credentials {
  email: string
  password: string
}
