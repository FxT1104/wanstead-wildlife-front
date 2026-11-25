/**
 * Journal communautaire : les visiteurs publient des notes de terrain.
 * Contrat attendu côté API décrit dans docs/api-contract.md.
 */

export const COMMUNITY_CATEGORIES = [
  'Birds',
  'Mammals',
  'Insects & invertebrates',
  'Plants & fungi',
  'Pond life',
  'Places & walks',
  'General',
] as const

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number]

export const LIMITS = {
  title: 140,
  authorName: 80,
  place: 120,
  body: 12000,
  photoAlt: 300,
  photoBytes: 5 * 1024 * 1024,
} as const

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export interface CommunityPost {
  id: string
  title: string
  category: CommunityCategory
  /** Nom affiché, facultatif (« A visitor » sinon) */
  authorName: string | null
  /** Lieu visité, facultatif */
  place: string | null
  body: string
  /** URL de la photo, ou null */
  photoUrl: string | null
  /** Description de la photo (obligatoire si photo) */
  photoAlt: string | null
  /** Date ISO 8601 */
  publishedAt: string
}

export interface CommunityPostInput {
  title: string
  category: CommunityCategory | ''
  authorName: string
  place: string
  body: string
  photo: File | null
  photoAlt: string
}

export interface CommunityPage {
  posts: CommunityPost[]
  page: number
  hasNext: boolean
}

export const PAGE_SIZE = 12
