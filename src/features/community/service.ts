import { api, ApiError } from '@/api/client'
import type { Collection, JsonLd } from '@/api/types'
import { PAGE_SIZE, type CommunityPage, type CommunityPost, type CommunityPostInput } from './types'

export interface ListOptions {
  categories?: string[]
  /** Commence à 1 */
  page?: number
}

export interface CommunityService {
  list(options?: ListOptions): Promise<CommunityPage>
  /** null si l'article n'existe pas */
  get(id: string): Promise<CommunityPost | null>
  publish(input: CommunityPostInput): Promise<CommunityPost>
  /** Modération : réservé à l'administrateur */
  remove(id: string): Promise<void>
}

// --- Implémentation API (contrat : docs/api-contract.md) --------------------

export const apiCommunityService: CommunityService = {
  async list({ categories = [], page = 1 } = {}) {
    const data = await api.get<Collection<CommunityPost & JsonLd>>('/community_posts', {
      query: { page, 'category[]': categories.length ? categories : undefined },
    })
    return { posts: data.member, page, hasNext: Boolean(data.view?.next) }
  },

  async get(id) {
    try {
      return await api.get<CommunityPost>(`/community_posts/${encodeURIComponent(id)}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },

  async publish(input) {
    const form = new FormData()
    form.append('title', input.title.trim())
    form.append('category', input.category)
    form.append('authorName', input.authorName.trim())
    form.append('place', input.place.trim())
    form.append('body', input.body.trim())
    if (input.photo) {
      form.append('photo', input.photo)
      form.append('photoAlt', input.photoAlt.trim())
    }
    return api.post<CommunityPost>('/community_posts', form)
  },

  remove: (id) => api.delete(`/community_posts/${encodeURIComponent(id)}`),
}

// --- Implémentation locale (démo sans back : stockage dans ce navigateur) --------

const STORAGE_KEY = 'ww:community'

const EXAMPLES: CommunityPost[] = [
  {
    id: 'example-robin',
    title: 'The robin beside the path',
    category: 'Birds',
    authorName: 'Fictional example',
    place: 'Bush Wood',
    body: 'I heard the rustle before I saw the bird. A robin was turning leaves over beside the path, almost the same brown as the ground until it turned towards me.\n\nI stood still for a minute. It hopped onto a low branch, paused, then dropped back to the patch it had been searching.',
    photoUrl: '/assets/groups/birds.webp',
    photoAlt: 'Field-guide illustration of a robin with an orange breast.',
    publishedAt: '2026-11-02T10:00:00.000Z',
  },
  {
    id: 'example-moss',
    title: 'A small forest on a fallen branch',
    category: 'Plants & fungi',
    authorName: 'Fictional example',
    place: 'Wanstead Park',
    body: 'After a shower, a fallen branch beside the path looked bright green along one edge. Crouching down, I could see a little canopy of separate shoots, each holding a bead of water.',
    photoUrl: '/assets/groups/liverworts-mosses.webp',
    photoAlt: 'Illustration of a cushion of moss with slender spore capsules.',
    publishedAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'example-dragonfly',
    title: 'Waiting for the dragonfly to land',
    category: 'Insects & invertebrates',
    authorName: 'Fictional example',
    place: 'Wanstead Flats',
    body: 'From the path beside the water I watched a dragonfly sweep past the same bent stem three times. On the next pass I watched the stem instead.\n\nThis time it landed.',
    photoUrl: '/assets/groups/insects.webp',
    photoAlt: 'Illustration of a dragonfly with two pairs of outstretched wings.',
    publishedAt: '2026-10-31T10:00:00.000Z',
  },
]

function readLocal(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const saved = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(saved) ? (saved as CommunityPost[]) : []
  } catch {
    return []
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function allLocal(): CommunityPost[] {
  return [...readLocal(), ...EXAMPLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export const localCommunityService: CommunityService = {
  async list({ categories = [], page = 1 } = {}) {
    const filtered = allLocal().filter((p) => !categories.length || categories.includes(p.category))
    const start = (page - 1) * PAGE_SIZE
    return { posts: filtered.slice(start, start + PAGE_SIZE), page, hasNext: filtered.length > start + PAGE_SIZE }
  },

  async get(id) {
    return allLocal().find((p) => p.id === id) ?? null
  },

  async publish(input) {
    const post: CommunityPost = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      category: input.category as CommunityPost['category'],
      authorName: input.authorName.trim() || null,
      place: input.place.trim() || null,
      body: input.body.trim(),
      photoUrl: input.photo ? await fileToDataUrl(input.photo) : null,
      photoAlt: input.photo ? input.photoAlt.trim() : null,
      publishedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([post, ...readLocal()]))
    } catch {
      throw new ApiError(
        507,
        'This browser could not store your article (storage is full or disabled). Try a smaller photo.',
      )
    }
    return post
  },

  async remove(id) {
    if (EXAMPLES.some((e) => e.id === id)) throw new ApiError(403, 'Example notes cannot be removed.')
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readLocal().filter((p) => p.id !== id)))
    } catch {
      throw new ApiError(507, 'The change could not be saved on this browser.')
    }
  },
}

export const isExamplePost = (id: string) => EXAMPLES.some((e) => e.id === id)

/**
 * Tant que l'endpoint /api/community_posts n'existe pas côté Symfony, le mode "local" permet de travailler.
 * VITE_COMMUNITY_BACKEND=api pour brancher la vraie API.
 */
export const communityService: CommunityService =
  import.meta.env.VITE_COMMUNITY_BACKEND === 'api' ? apiCommunityService : localCommunityService
