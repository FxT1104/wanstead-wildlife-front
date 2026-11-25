<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuth } from '@/features/auth/useAuth'
import { useAdminStats } from '@/features/admin/useAdminStats'

const route = useRoute()
const { email } = useAuth()
const { stats, refresh } = useAdminStats()

/** Icônes décoratives (aria-hidden) : le texte du lien suffit. */
const ICONS = {
  overview: 'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z',
  articles: 'M5 3h10l4 4v14H5zM15 3v4h4M8 11h8M8 15h8M8 19h5',
  community: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  support: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14M12 17.5v.01',
} as const

const groups = [
  { label: 'Dashboard', items: [{ name: 'admin', label: 'Overview', icon: ICONS.overview, exact: true }] },
  {
    label: 'Content',
    items: [
      { name: 'admin-articles', label: 'Articles', icon: ICONS.articles, exact: false },
      { name: 'admin-community', label: 'Community journal', icon: ICONS.community, exact: false },
    ],
  },
  {
    label: 'Visitors',
    items: [{ name: 'admin-support', label: 'Help requests', icon: ICONS.support, exact: false, badge: true }],
  },
]

/** « Articles » reste actif sur la page d'écriture et de modification d'un article. */
function isActive(name: string, exact: boolean) {
  if (exact) return route.name === name
  return typeof route.name === 'string' && (route.name === name || route.name.startsWith(name.replace(/s$/, '') + '-'))
}

onMounted(refresh)
// Les compteurs suivent les changements faits dans les pages (clôture d'une demande, suppression…).
watch(() => route.fullPath, refresh)
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <p class="admin-sidebar-title">Administration</p>
      <p v-if="email" class="admin-user">Signed in as <span>{{ email }}</span></p>

      <RouterLink class="primary-link admin-new" :to="{ name: 'admin-article-new' }">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" /></svg>
        New article
      </RouterLink>

      <nav aria-label="Administration">
        <div v-for="g in groups" :key="g.label" class="admin-nav-group">
          <p class="admin-nav-label" aria-hidden="true">{{ g.label }}</p>
          <ul>
            <li v-for="item in g.items" :key="item.name">
              <RouterLink
                :to="{ name: item.name }"
                class="admin-nav-link"
                :aria-current="isActive(item.name, item.exact) ? 'page' : undefined"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path :d="item.icon" /></svg>
                <span class="admin-nav-text">{{ item.label }}</span>
                <span v-if="'badge' in item && stats.openRequests" class="admin-badge">
                  {{ stats.openRequests }}<span class="sr-only"> waiting</span>
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <RouterLink class="admin-back" to="/">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M15 6l-6 6l6 6" /></svg>
        Back to the website
      </RouterLink>
    </aside>

    <div class="admin-content">
      <RouterView />
    </div>
  </div>
</template>
