<script setup lang="ts">
/**
 * Article officiel (écrit dans l'espace admin, servi par l'API).
 * Mise en page commune avec les articles migrés (archive-*), texte affiché sans HTML.
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import HelpWithPage from '@/components/content/HelpWithPage.vue'
import { articles } from '@/api/endpoints'
import { ApiError } from '@/api/client'
import type { Article } from '@/api/types'
import { useAuth } from '@/features/auth/useAuth'
import { formatDate } from '@/features/community/format'
import { coverFor } from '@/features/news/coverImage'
import { excerptOf, loadCategoryNames, loadPublishedArticles, toBlocks } from '@/features/news/officialArticles'
import { readingMinutes } from '@/features/reading/split'

const props = defineProps<{ id: number }>()
const router = useRouter()
const { isAdmin } = useAuth()

const article = ref<Article | null>(null)
const categoryName = ref('')
const more = ref<Article[]>([])
const state = ref<'loading' | 'ready' | 'missing' | 'error'>('loading')

watch(
  () => props.id,
  async (id) => {
    state.value = 'loading'
    try {
      const a = await articles.get(id)
      // Adresse lisible : /news/12/le-slug (corrige un slug absent ou ancien sans ajouter d'entrée d'historique).
      // Fait avant l'affichage : le titre de l'onglet, posé par le routeur, est ensuite remplacé par celui de l'article.
      if (router.currentRoute.value.params.slug !== a.slug)
        await router.replace({ name: 'news-article', params: { id: a.id, slug: a.slug }, hash: router.currentRoute.value.hash })
      article.value = a
      state.value = 'ready'
      document.title = `${a.title} — Wanstead Wildlife`
      const [names, latest] = await Promise.all([loadCategoryNames(), loadPublishedArticles().catch(() => [])])
      categoryName.value = names.get(a.category) ?? ''
      more.value = latest.filter((x) => x.id !== a.id).slice(0, 4)
    } catch (error) {
      article.value = null
      state.value = error instanceof ApiError && error.status === 404 ? 'missing' : 'error'
    }
  },
  { immediate: true },
)

const blocks = computed(() => (article.value ? toBlocks(article.value.content) : []))
const headings = computed(() => blocks.value.filter((b) => b.kind === 'heading'))
const minutes = computed(() => (article.value ? readingMinutes(article.value.content) : 0))
const cover = computed(() =>
  article.value ? coverFor({ title: article.value.title, excerpt: excerptOf(article.value), image: null }) : null,
)

const title = computed(() => {
  if (state.value === 'ready' && article.value) return article.value.title
  if (state.value === 'missing') return 'Article not found'
  if (state.value === 'error') return 'Article unavailable'
  return 'Loading article…'
})
</script>

<template>
  <AppBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'News', to: '/news' }, { label: title }]" />

  <header class="article-hero article-width" :class="{ 'has-cover': cover && article }">
    <div class="article-hero-text">
      <p class="eyebrow">{{ categoryName ? `NEWS · ${categoryName.toUpperCase()}` : 'NEWS' }}</p>
      <h1>{{ title }}</h1>
      <p v-if="article" class="article-meta">
        <template v-if="article.publishedAt">
          Published <time :datetime="article.publishedAt">{{ formatDate(article.publishedAt) }}</time>
        </template>
        <template v-else>Draft</template>
        <span aria-hidden="true">·</span>
        {{ minutes }} min read
      </p>
      <p v-if="article?.summary" class="article-standfirst">{{ article.summary }}</p>
    </div>
    <figure v-if="cover && article" class="article-hero-media" :class="{ 'is-illustration': cover.illustration }">
      <!-- Illustration choisie d'après le sujet : décorative -->
      <img :src="cover.src" alt="" />
    </figure>
  </header>

  <article class="page-column article-width">
    <p v-if="state === 'loading'" role="status">Loading the article…</p>
    <p v-else-if="state === 'missing'">
      This article does not exist or is no longer published. <RouterLink to="/news">See all news</RouterLink>.
    </p>
    <p v-else-if="state === 'error'" role="alert">
      The article could not be loaded. Please try again later, or <RouterLink to="/news">see all news</RouterLink>.
    </p>

    <template v-else-if="article">
      <p v-if="!article.publishedAt" class="draft-notice" role="note">
        This is a draft: only administrators can see it.
      </p>
      <p v-if="isAdmin" class="admin-shortcut">
        <RouterLink :to="{ name: 'admin-article-edit', params: { id: article.id } }">Edit this article</RouterLink>
      </p>

      <div class="archive-wrap">
        <div class="archive-layout" :class="{ 'has-aside': headings.length > 1 || more.length }">
          <div v-if="headings.length > 1 || more.length" class="archive-aside">
            <nav v-if="headings.length > 1" class="archive-toc" aria-labelledby="toc-title">
              <h2 id="toc-title">On this page</h2>
              <ol>
                <li v-for="h in headings" :key="h.id">
                  <a :href="`#${h.id}`">{{ h.text }}</a>
                </li>
              </ol>
            </nav>
            <nav v-if="more.length" class="aside-card" aria-labelledby="more-title">
              <h2 id="more-title">Latest news</h2>
              <ul>
                <li v-for="m in more" :key="m.id">
                  <RouterLink :to="{ name: 'news-article', params: { id: m.id, slug: m.slug } }">{{ m.title }}</RouterLink>
                </li>
              </ul>
              <RouterLink class="aside-all" to="/news">All news <span aria-hidden="true">→</span></RouterLink>
            </nav>
          </div>

          <div class="archive-blocks">
            <template v-for="(b, i) in blocks" :key="i">
              <h2 v-if="b.kind === 'heading'" :id="b.id" tabindex="-1">{{ b.text }}</h2>
              <p v-else class="preserve-lines">{{ b.text }}</p>
            </template>
          </div>
        </div>
      </div>
    </template>
  </article>

  <HelpWithPage />
</template>
