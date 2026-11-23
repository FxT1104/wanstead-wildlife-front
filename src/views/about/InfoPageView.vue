<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import ProseBlock from '@/components/content/ProseBlock.vue'
import PhotoFigure from '@/components/content/PhotoFigure.vue'
import ContentPending from '@/components/content/ContentPending.vue'
import HelpWithPage from '@/components/content/HelpWithPage.vue'
import ArchiveBlocks from '@/components/content/ArchiveBlocks.vue'
import MoreAbout from '@/components/content/MoreAbout.vue'
import { useArchiveFor, useHomedPages } from '@/content/archive'
import { findInfoPage, infoPages } from '@/content'

const props = defineProps<{ page: string }>()

// Page migrée telle quelle depuis le site actuel, en attendant le contenu structuré
const archive = useArchiveFor('info', () => props.page)
const more = useHomedPages('info', () => props.page)

// La route vérifie déjà que la page existe (beforeEnter).
const info = computed(() => findInfoPage(props.page)!)
const related = computed(() => infoPages.filter((p) => p.theme === info.value.theme && p.slug !== info.value.slug))
</script>

<template>
  <AppBreadcrumb
    :items="[{ label: 'Home', to: '/' }, { label: 'About the Website', to: '/about' }, { label: info.title }]"
  />

  <header class="info-hero">
    <p class="eyebrow">ABOUT THE WEBSITE</p>
    <h1>{{ info.title }}</h1>
    <p class="info-summary">{{ info.summary }}</p>
  </header>

  <div class="info-layout">
    <article class="info-body">
      <ArchiveBlocks v-if="!info.sections.length && archive" :page="archive" />
      <ContentPending v-else-if="!info.sections.length" :what="`“${info.title}”`" />

      <section
        v-for="(section, i) in info.sections"
        :key="i"
        class="info-section"
        :aria-label="section.heading ? undefined : info.title"
      >
        <h2 v-if="section.heading">{{ section.heading }}</h2>
        <ProseBlock v-if="section.paragraphs?.length" :paragraphs="section.paragraphs" />
        <ul v-if="section.list?.length">
          <li v-for="(item, j) in section.list" :key="j">{{ item }}</li>
        </ul>
        <dl v-if="section.definitions?.length" class="definitions">
          <template v-for="d in section.definitions" :key="d.term">
            <dt>{{ d.term }}</dt>
            <dd>{{ d.description }}</dd>
          </template>
        </dl>
        <div
          v-if="section.table"
          class="table-scroll"
          role="region"
          :aria-label="section.table.caption"
          tabindex="0"
        >
          <table class="records-table">
            <caption>{{ section.table.caption }}</caption>
            <thead>
              <tr>
                <th v-for="c in section.table.columns" :key="c" scope="col">{{ c }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, r) in section.table.rows" :key="r">
                <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="section.photos?.length" class="photo-grid">
          <PhotoFigure v-for="photo in section.photos" :key="photo.src" :photo="photo" />
        </div>
      </section>
    </article>

    <nav v-if="related.length" aria-labelledby="related-title" class="related-pages">
      <h2 id="related-title">Related pages</h2>
      <ul>
        <li v-for="p in related" :key="p.slug">
          <RouterLink :to="{ name: 'info', params: { page: p.slug } }">{{ p.title }}</RouterLink>
        </li>
      </ul>
      <RouterLink to="/about" class="related-all">All “About” pages</RouterLink>
    </nav>
  </div>

  <MoreAbout :title="`More on “${info.title}”`" :pages="more" />

  <HelpWithPage />
</template>
