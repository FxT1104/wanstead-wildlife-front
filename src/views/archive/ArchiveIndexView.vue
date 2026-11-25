<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import { loadArchiveIndex } from '@/content/archive'
import type { ArchiveEntry } from '@/content/types'
import { normalise } from '@/data/catalogue'

const pages = ref<ArchiveEntry[]>([])
const loaded = ref(false)
const query = ref('')

onMounted(async () => {
  pages.value = await loadArchiveIndex()
  loaded.value = true
})

/** Route d'une page : sa page du nouveau site si elle est rattachée, sinon /archive/… */
const routeOf = (p: ArchiveEntry) =>
  p.target?.kind === 'group'
    ? { name: 'wildlife-group', params: { group: p.target.slug } }
    : p.target?.kind === 'place'
      ? { name: 'place', params: { place: p.target.slug } }
      : p.target?.kind === 'info'
        ? { name: 'info', params: { page: p.target.slug } }
        : { name: 'archive-page', params: { slug: p.slug } }

const sections = computed(() => {
  const q = normalise(query.value)
  const groups = new Map<string, ArchiveEntry[]>()
  for (const p of pages.value) {
    if (q && !normalise(`${p.title} ${p.section ?? ''}`).includes(q)) continue
    const key = p.section && p.section !== 'Main Menu' ? p.section : 'Other pages'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(p)
  }
  return [...groups.entries()].sort(([a], [b]) => (a === 'Other pages' ? 1 : b === 'Other pages' ? -1 : a.localeCompare(b)))
})
const total = computed(() => sections.value.reduce((n, [, list]) => n + list.length, 0))
</script>

<template>
  <AppBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Archive' }]" />

  <header class="info-hero">
    <p class="eyebrow">EVERYTHING FROM THE PREVIOUS WEBSITE</p>
    <h1>Archive</h1>
    <p class="info-summary">Every page of the previous Wanstead Wildlife website, grouped by section.</p>
  </header>

  <section class="page-column" aria-label="Archive pages">
    <div class="species-filter">
      <label for="archive-query">Find a page</label>
      <input id="archive-query" v-model="query" type="search" autocomplete="off" />
      <p role="status">{{ loaded ? `${total} pages` : 'Loading…' }}</p>
    </div>

    <p v-if="loaded && !pages.length">
      The archive is empty: run <code>npm run migrate:crawl</code> then <code>npm run migrate:build</code>.
    </p>

    <section v-for="[section, list] in sections" :key="section" class="archive-section" :aria-label="section">
      <h2>{{ section }}</h2>
      <ul class="species-list">
        <li v-for="p in list" :key="p.slug">
          <RouterLink :to="routeOf(p)">
            <span class="species-name">{{ p.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </section>
</template>
