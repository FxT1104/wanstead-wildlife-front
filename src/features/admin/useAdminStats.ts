/**
 * Compteurs de l'administration (menu et tableau de bord).
 * Partagés : le menu affiche le nombre de demandes en attente, rafraîchi quand une page admin change quelque chose.
 */
import { ref } from 'vue'
import { api } from '@/api/client'
import type { Article, Collection } from '@/api/types'
import { articles } from '@/api/endpoints'
import { supportService } from '@/features/support/support'

export interface AdminStats {
  /** Demandes d'aide pas encore closes */
  openRequests: number | null
  articles: number | null
  /** null si on n'a pas tout chargé (plus d'une page) */
  drafts: number | null
  communityNotes: number | null
}

const stats = ref<AdminStats>({ openRequests: null, articles: null, drafts: null, communityNotes: null })
const loading = ref(false)

async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch {
    return null
  }
}

async function refresh() {
  loading.value = true
  const [requests, list, notes] = await Promise.all([
    settle(supportService.list()),
    settle(articles.list()),
    settle(api.get<Collection<Article>>('/community_posts')),
  ])
  stats.value = {
    openRequests: requests ? requests.filter((r) => r.status !== 'closed').length : null,
    articles: list ? list.totalItems : null,
    drafts: list && list.member.length === list.totalItems ? list.member.filter((a) => !a.publishedAt).length : null,
    communityNotes: notes ? notes.totalItems : null,
  }
  loading.value = false
}

export function useAdminStats() {
  return { stats, loading, refresh }
}
