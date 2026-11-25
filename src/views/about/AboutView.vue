<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import { infoPages } from '@/content'
import type { InfoPage } from '@/content/types'

const themes: { key: InfoPage['theme']; eyebrow: string; title: string }[] = [
  { key: 'website', eyebrow: 'WHO AND HOW', title: 'The website and its author' },
  { key: 'wildlife', eyebrow: 'IN THE FIELD', title: 'Wildlife and the study area' },
  { key: 'records', eyebrow: 'WHAT’S NEW', title: 'Reports and updates' },
]

const pagesIn = (theme: InfoPage['theme']) => infoPages.filter((p) => p.theme === theme)
</script>

<template>
  <AppBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'About the Website' }]" />

  <article class="archive-essay about-hero">
    <div class="archive-cover">
      <h1>The story<br /><em>behind it.</em></h1>
      <img src="/assets/groups/plants.webp" alt="" />
    </div>
    <div class="archive-prose">
      <p>
        More than forty years of observations of the animals, plants and fungi of the southern part of Epping Forest,
        around Wanstead in east London.
      </p>
      <p class="about-lede">
        The records and photographs are the work of Paul Ferris, a volunteer naturalist, with the help of local groups
        and many other observers.
      </p>
    </div>
  </article>

  <section class="about-archive" aria-labelledby="archive-title">
    <h2 id="archive-title" class="sr-only">Explore the archive</h2>
    <div class="about-themes">
      <section v-for="t in themes" :key="t.key" class="about-theme" :aria-labelledby="`theme-${t.key}`">
        <p class="eyebrow">{{ t.eyebrow }}</p>
        <h3 :id="`theme-${t.key}`">{{ t.title }}</h3>
        <ul>
          <li v-for="p in pagesIn(t.key)" :key="p.slug">
            <RouterLink :to="{ name: 'info', params: { page: p.slug } }" class="about-link">
              <span class="about-link-title">{{ p.title }}</span>
              <span class="about-link-summary">{{ p.summary }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
