<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStats } from '@/features/admin/useAdminStats'

const { stats, loading } = useAdminStats()

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const tiles = computed(() => [
  {
    key: 'support',
    title: 'Help requests',
    value: stats.value.openRequests,
    unit: (n: number) => (n === 1 ? 'request waiting' : 'requests waiting'),
    text: 'Questions and problems sent by visitors.',
    to: { name: 'admin-support' },
    action: 'Answer requests',
    urgent: (stats.value.openRequests ?? 0) > 0,
  },
  {
    key: 'articles',
    title: 'Articles',
    value: stats.value.articles,
    unit: (n: number) => (n === 1 ? 'article' : 'articles'),
    text:
      stats.value.drafts === null
        ? 'Edit, publish, unpublish or delete articles.'
        : `${plural(stats.value.drafts, 'draft', 'drafts')} not yet published.`,
    to: { name: 'admin-articles' },
    action: 'Manage articles',
    urgent: false,
  },
  {
    key: 'community',
    title: 'Community journal',
    value: stats.value.communityNotes,
    unit: (n: number) => (n === 1 ? 'note published' : 'notes published'),
    text: 'Remove notes that break the rules.',
    to: { name: 'admin-community' },
    action: 'Review notes',
    urgent: false,
  },
])
</script>

<template>
  <header class="admin-page-head">
    <h1>Overview</h1>
    <p>What needs your attention on Wanstead Wildlife.</p>
  </header>

  <ul class="admin-tiles" :aria-busy="loading">
    <li v-for="t in tiles" :key="t.key" :class="{ 'is-urgent': t.urgent }">
      <h2>{{ t.title }}</h2>
      <p class="admin-tile-figure">
        <template v-if="t.value !== null">
          <strong>{{ t.value }}</strong> {{ t.unit(t.value) }}
        </template>
        <template v-else-if="loading">Loading…</template>
        <template v-else>Unavailable</template>
      </p>
      <p>{{ t.text }}</p>
      <RouterLink :to="t.to" class="admin-tile-link">{{ t.action }}</RouterLink>
    </li>
  </ul>

  <section class="admin-quick" aria-labelledby="quick-heading">
    <h2 id="quick-heading">Quick actions</h2>
    <ul>
      <li><RouterLink :to="{ name: 'admin-article-new' }">Write a new article</RouterLink></li>
      <li><RouterLink to="/community">See the community journal as visitors do</RouterLink></li>
      <li><RouterLink to="/help">See the help page as visitors do</RouterLink></li>
    </ul>
  </section>
</template>
