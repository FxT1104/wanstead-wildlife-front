/**
 * SAV (Must du CDC) : un visiteur envoie une demande, l'administrateur la suit jusqu'à sa clôture.
 * Contrat attendu côté API : docs/api-contract.md (section « Demandes d'aide »).
 */
import { api, ApiError } from '@/api/client'
import type { Collection } from '@/api/types'
import { readJson, writeJson } from '@/lib/storage'
import type { SummaryError } from '@/features/forms/errors'

export const TOPICS = {
  support: 'General question',
  accessibility: 'Accessibility problem',
  content: 'Error in the content (wrong name, date, photo…)',
} as const
export type Topic = keyof typeof TOPICS

export const STATUSES = { open: 'Received', in_progress: 'Being handled', closed: 'Closed' } as const
export type Status = keyof typeof STATUSES

export interface SupportRequest {
  id: string
  topic: Topic
  subject: string
  description: string
  /** Facultatif : pour recevoir une réponse */
  email: string | null
  /** Page concernée (URL), facultatif */
  page: string | null
  status: Status
  createdAt: string
  updatedAt: string
}

export interface SupportInput {
  topic: Topic
  subject: string
  description: string
  email: string
  page: string
}

export const SUPPORT_LIMITS = { subject: 150, description: 5000, page: 300 } as const

export function isTopic(value: unknown): value is Topic {
  return typeof value === 'string' && value in TOPICS
}

export function validateSupport(input: SupportInput): SummaryError[] {
  const errors: SummaryError[] = []
  if (!isTopic(input.topic)) errors.push({ field: 'topic', message: 'Choose what your request is about.' })
  const subject = input.subject.trim()
  if (!subject) errors.push({ field: 'subject', message: 'Enter a subject.' })
  else if (subject.length > SUPPORT_LIMITS.subject)
    errors.push({ field: 'subject', message: `Use ${SUPPORT_LIMITS.subject} characters or fewer for the subject.` })
  const description = input.description.trim()
  if (!description) errors.push({ field: 'description', message: 'Describe your question or the problem.' })
  else if (description.length > SUPPORT_LIMITS.description)
    errors.push({
      field: 'description',
      message: `Use ${SUPPORT_LIMITS.description} characters or fewer for the description.`,
    })
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    errors.push({ field: 'email', message: 'Enter an email address like name@example.com, or leave it empty.' })
  if (input.page.trim().length > SUPPORT_LIMITS.page)
    errors.push({ field: 'page', message: `Use ${SUPPORT_LIMITS.page} characters or fewer for the page.` })
  return errors
}

/**
 * Référence courte lisible, communiquée au visiteur.
 * L'API génère des UUID v7 : leur début est l'heure de création (identique pour deux demandes proches),
 * leur fin est aléatoire. On prend donc les 8 derniers caractères.
 */
export const reference = (id: string) => id.replace(/-/g, '').slice(-8).toUpperCase()

export interface SupportService {
  create(input: SupportInput): Promise<SupportRequest>
  /** Demandes dont l'id est connu (suivi par le visiteur) ; les ids inconnus sont ignorés */
  getMany(ids: string[]): Promise<SupportRequest[]>
  /** Toutes les demandes (administrateur) */
  list(): Promise<SupportRequest[]>
  setStatus(id: string, status: Status): Promise<SupportRequest>
}

// --- API ---------------------------------------------------------------------

export const apiSupportService: SupportService = {
  create: (input) =>
    api.post<SupportRequest>('/support_requests', {
      topic: input.topic,
      subject: input.subject.trim(),
      description: input.description.trim(),
      email: input.email.trim() || null,
      page: input.page.trim() || null,
    }),
  async getMany(ids) {
    const found = await Promise.all(
      ids.map((id) =>
        api.get<SupportRequest>(`/support_requests/${encodeURIComponent(id)}`).catch((e: unknown) => {
          if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return null
          throw e
        }),
      ),
    )
    return found.filter((r): r is SupportRequest => r !== null)
  },
  async list() {
    return (await api.get<Collection<SupportRequest>>('/support_requests', { query: { pagination: false } })).member
  },
  setStatus: (id, status) => api.patch<SupportRequest>(`/support_requests/${encodeURIComponent(id)}`, { status }),
}

// --- Local (démo sans back) ---------------------------------------------------

const LOCAL_KEY = 'ww:support'

export const localSupportService: SupportService = {
  async create(input) {
    const now = new Date().toISOString()
    const request: SupportRequest = {
      id: crypto.randomUUID(),
      topic: input.topic,
      subject: input.subject.trim(),
      description: input.description.trim(),
      email: input.email.trim() || null,
      page: input.page.trim() || null,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    }
    if (!writeJson(LOCAL_KEY, [request, ...readJson<SupportRequest[]>(LOCAL_KEY, [])]))
      throw new ApiError(507, 'This browser could not save your request (storage is full or disabled).')
    return request
  },
  async getMany(ids) {
    return readJson<SupportRequest[]>(LOCAL_KEY, []).filter((r) => ids.includes(r.id))
  },
  async list() {
    return readJson<SupportRequest[]>(LOCAL_KEY, [])
  },
  async setStatus(id, status) {
    const all = readJson<SupportRequest[]>(LOCAL_KEY, [])
    const target = all.find((r) => r.id === id)
    if (!target) throw new ApiError(404, 'This request no longer exists.')
    target.status = status
    target.updatedAt = new Date().toISOString()
    if (!writeJson(LOCAL_KEY, all)) throw new ApiError(507, 'The change could not be saved on this browser.')
    return target
  },
}

/** Par défaut : l'API (/api/support_requests). VITE_SUPPORT_BACKEND=local : stockage dans le navigateur (démo sans back, tests). */
export const supportService: SupportService =
  import.meta.env.VITE_SUPPORT_BACKEND === 'local' ? localSupportService : apiSupportService

// --- Suivi côté visiteur : on garde les ids des demandes envoyées depuis ce navigateur ---

const MINE_KEY = 'ww:my-requests'
export const myRequestIds = (): string[] => readJson<string[]>(MINE_KEY, [])
export const rememberRequest = (id: string) => writeJson(MINE_KEY, [id, ...myRequestIds()].slice(0, 50))
