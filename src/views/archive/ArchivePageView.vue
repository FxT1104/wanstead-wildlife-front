<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import ArchiveBlocks from '@/components/content/ArchiveBlocks.vue'
import HelpWithPage from '@/components/content/HelpWithPage.vue'
import { findArchivePage, siblingsOf } from '@/content/archive'
import { findInfoPage, groupOf } from '@/content'
import { places } from '@/data/catalogue'
import { coverFor } from '@/features/news/coverImage'
import { readingMinutes } from '@/features/reading/split'
import type { ArchiveEntry, ArchivePage, Block } from '@/content/types'

const props = defineProps<{ slug: string }>()

const page = ref<ArchivePage | null>(null)
const related = ref<ArchiveEntry[]>([])
const state = ref<'loading' | 'ready' | 'missing'>('loading')

watch(
  () => props.slug,
  async (slug) => {
    state.value = 'loading'
    page.value = (await findArchivePage(slug)) ?? null
    state.value = page.value ? 'ready' : 'missing'
    related.value = page.value ? await siblingsOf(page.value) : []
    if (page.value) document.title = `${page.value.title} — Wanstead Wildlife`
  },
  { immediate: true },
)

/** Rubrique de la page : libellé et lien, pour le fil d'Ariane et la colonne latérale */
const section = computed<{ label: string; to: RouteLocationRaw; parents: { label: string; to: string }[] } | null>(() => {
  const home = page.value?.home
  if (home?.kind === 'news') return { label: 'News', to: '/news', parents: [] }
  if (home?.kind === 'group')
    return {
      label: groupOf(home.slug)?.name ?? 'Wildlife',
      to: { name: 'wildlife-group', params: { group: home.slug } },
      parents: [{ label: 'Wildlife', to: '/wildlife' }],
    }
  if (home?.kind === 'place')
    return {
      label: places.find((p) => p.slug === home.slug)?.name ?? 'Places',
      to: { name: 'place', params: { place: home.slug } },
      parents: [{ label: 'Places', to: '/places' }],
    }
  if (home?.kind === 'info')
    return {
      label: findInfoPage(home.slug)?.title ?? 'About',
      to: { name: 'info', params: { page: home.slug } },
      parents: [{ label: 'About', to: '/about' }],
    }
  return null
})

const trail = computed(() => [
  { label: 'Home', to: '/' },
  ...(section.value
    ? [...section.value.parents, { label: section.value.label, to: section.value.to }]
    : [{ label: 'Archive', to: '/archive' }]),
  { label: page.value?.title ?? 'Page' },
])

const firstImage = computed(
  () => page.value?.blocks.find((b): b is Extract<Block, { type: 'image' }> => b.type === 'image') ?? null,
)
/** Image d'en-tête : la première photo de l'article, sinon une illustration (décorative) */
// Photo d'en-tête introuvable sur l'ancien site : illustration du sujet à la place.
const coverBroken = ref(false)
watch(() => props.slug, () => (coverBroken.value = false))
const realCover = computed(() => !!page.value?.image && !coverBroken.value)
const cover = computed(() =>
  page.value
    ? coverFor({ title: page.value.title, excerpt: page.value.excerpt, image: realCover.value ? page.value.image : null })
    : null,
)

const minutes = computed(() => {
  if (!page.value) return 0
  const text = page.value.blocks
    .map((b) =>
      b.type === 'paragraph'
        ? b.runs.map((r) => r.text).join('')
        : b.type === 'list'
          ? b.items.flat().map((r) => r.text).join(' ')
          : b.type === 'heading'
            ? b.text
            : '',
    )
    .join(' ')
  return readingMinutes(text)
})
</script>

<template>
  <AppBreadcrumb :items="trail" />

  <header class="article-hero article-width" :class="{ 'has-cover': cover }">
    <div class="article-hero-text">
      <p class="eyebrow">{{ section?.label.toUpperCase() ?? 'FROM THE PREVIOUS WEBSITE' }}</p>
      <h1>{{ state === 'missing' ? 'Page not found' : (page?.title ?? 'Loading…') }}</h1>
      <p v-if="page" class="article-meta">
        {{ minutes }} min read
        <span aria-hidden="true">·</span>
        From the Wanstead Wildlife records
      </p>
    </div>
    <figure v-if="cover && page" class="article-hero-media" :class="{ 'is-illustration': cover.illustration }">
      <!-- Photo de l'article : sa description ; illustration de remplacement : décorative. -->
      <img :src="cover.src" :alt="firstImage && realCover ? firstImage.alt : ''" @error="coverBroken = true" />
      <figcaption v-if="firstImage?.caption && realCover">{{ firstImage.caption }}</figcaption>
    </figure>
  </header>

  <article class="page-column article-width">
    <p v-if="state === 'missing'">This page does not exist in the archive.</p>
    <ArchiveBlocks v-else-if="page" :page="page" :skip-first-image="!!page.image">
      <template #aside>
        <section class="aside-card" aria-labelledby="about-page-title">
          <h2 id="about-page-title">About this page</h2>
          <dl>
            <template v-if="section">
              <dt>Section</dt>
              <dd><RouterLink :to="section.to">{{ section.label }}</RouterLink></dd>
            </template>
            <dt>Reading time</dt>
            <dd>{{ minutes }} min</dd>
          </dl>
        </section>
        <nav v-if="related.length" class="aside-card" aria-labelledby="related-title">
          <h2 id="related-title">{{ section?.label === 'News' ? 'More news' : `More in ${section?.label}` }}</h2>
          <ul>
            <li v-for="r in related" :key="r.slug">
              <RouterLink :to="{ name: 'archive-page', params: { slug: r.slug } }">{{ r.title }}</RouterLink>
            </li>
          </ul>
          <RouterLink v-if="section" class="aside-all" :to="section.to">
            {{ section.label === 'News' ? 'All news' : `All of ${section.label}` }}
            <span aria-hidden="true">→</span>
          </RouterLink>
        </nav>
      </template>
    </ArchiveBlocks>
  </article>

  <HelpWithPage />
</template>
