<script setup lang="ts">
/**
 * News : d'abord les articles officiels écrits dans l'espace admin (API), du plus récent au plus ancien,
 * puis les articles de l'ancien site (migrés). Si l'API ne répond pas, les articles migrés restent affichés.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import ArticleCard from '@/components/content/ArticleCard.vue'
import { newsEntries } from '@/content/archive'
import type { ArchiveEntry } from '@/content/types'
import { normalise } from '@/data/catalogue'
import { formatDate } from '@/features/community/format'
import { excerptOf, loadPublishedArticles } from '@/features/news/officialArticles'

const PAGE_SIZE = 12
const route = useRoute()
const router = useRouter()

interface NewsItem {
  key: string
  title: string
  excerpt: string
  image: string | null
  to: RouteLocationRaw
  kicker?: string
}

const all = ref<NewsItem[]>([])
const loaded = ref(false)
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

const fromArchive = (p: ArchiveEntry): NewsItem => ({
  key: `archive-${p.slug}`,
  title: p.title,
  excerpt: p.excerpt,
  image: p.image,
  to: { name: 'archive-page', params: { slug: p.slug } },
})

onMounted(async () => {
  const [official, archive] = await Promise.all([loadPublishedArticles().catch(() => []), newsEntries()])
  all.value = [
    ...official.map(
      (a): NewsItem => ({
        key: `article-${a.id}`,
        title: a.title,
        excerpt: excerptOf(a),
        image: null,
        to: { name: 'news-article', params: { id: a.id, slug: a.slug } },
        kicker: `New · ${formatDate(a.publishedAt)}`,
      }),
    ),
    ...archive.map(fromArchive),
  ]
  loaded.value = true
})

const filtered = computed(() => {
  const terms = normalise(query.value).split(/\s+/).filter(Boolean)
  return all.value.filter((p) => terms.every((t) => normalise(p.title).includes(t)))
})
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page ?? '1'), 10) || 1))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const visible = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// La recherche est gardée dans l'URL (partage, bouton Retour) et revient à la page 1.
watch(query, (q) => router.replace({ query: q.trim() ? { q: q.trim() } : {} }))

const status = computed(() => {
  if (!loaded.value) return 'Loading articles…'
  const n = filtered.value.length
  return query.value.trim() ? `${n} ${n === 1 ? 'article matches' : 'articles match'} “${query.value.trim()}”` : `${n} articles`
})

const pageLink = (n: number) => ({ query: { ...route.query, page: n > 1 ? String(n) : undefined } })
</script>

<template>
  <AppBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'News' }]" />

  <header class="info-hero">
    <p class="eyebrow">NEWS AND ARTICLES</p>
    <h1>News</h1>
    <p class="info-summary">Sightings, records, reports and local issues, newest first.</p>
  </header>

  <section class="page-column" aria-label="Articles">
    <div class="species-filter">
      <label for="news-query">Find an article</label>
      <input id="news-query" v-model="query" type="search" autocomplete="off" placeholder="e.g. skylark, fire, moths" />
      <p role="status">{{ status }}</p>
    </div>

    <ul class="card-grid">
      <li v-for="p in visible" :key="p.key">
        <ArticleCard :title="p.title" :excerpt="p.excerpt" :image="p.image" :to="p.to" :kicker="p.kicker" />
      </li>
    </ul>
    <p v-if="loaded && !filtered.length">No articles found. Try another word.</p>

    <nav v-if="pages > 1" class="place-pager" aria-label="News pages">
      <RouterLink v-if="page > 1" :to="pageLink(page - 1)" rel="prev">← Newer articles</RouterLink>
      <span>Page {{ page }} of {{ pages }}</span>
      <RouterLink v-if="page < pages" :to="pageLink(page + 1)" rel="next">Older articles →</RouterLink>
    </nav>
  </section>
</template>
