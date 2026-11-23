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
import { findPlaceContent, groupOf, speciesAtPlace } from '@/content'
import { places } from '@/data/catalogue'
import { formatDate } from '@/features/community/format'

const props = defineProps<{ place: string }>()

// Page migrée telle quelle depuis le site actuel, en attendant le contenu structuré
const archive = useArchiveFor('place', () => props.place)
const more = useHomedPages('place', () => props.place)

// La route vérifie déjà que le lieu existe (beforeEnter).
const index = computed(() => places.findIndex((p) => p.slug === props.place))
const site = computed(() => places[index.value]!)
const content = computed(() => findPlaceContent(props.place))
const seen = computed(() => speciesAtPlace(props.place))

const glance = computed(() =>
  [
    { term: 'Location', value: content.value?.atAGlance?.location },
    { term: 'Habitats', value: content.value?.atAGlance?.habitats },
    { term: 'Access', value: content.value?.atAGlance?.access },
  ].filter((d) => d.value),
)

const access = computed(() => {
  const a = content.value?.accessInformation
  return [
    { term: 'Paths and surfaces', value: a?.pathsAndSurfaces },
    { term: 'Step-free access', value: a?.stepFreeAccess },
    { term: 'Facilities and transport', value: a?.facilitiesAndTransport },
  ].filter((d) => d.value)
})

const hasText = computed(
  () => !!(content.value?.intro?.length || content.value?.about?.length || content.value?.habitatsAndWildlife?.length),
)

const previous = computed(() => places[(index.value - 1 + places.length) % places.length]!)
const next = computed(() => places[(index.value + 1) % places.length]!)
</script>

<template>
  <AppBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Wildlife Sites', to: '/places' }, { label: site.name }]" />

  <section class="place-template">
    <div>
      <p class="eyebrow">WILDLIFE SITES</p>
      <h1 class="page-title">{{ site.name }}</h1>
      <ProseBlock v-if="content?.intro?.length" :paragraphs="content.intro" />
    </div>
    <PhotoFigure v-if="content?.photos?.[0]" :photo="content.photos[0]" eager />
  </section>

  <section v-if="!hasText && archive" class="page-column archive-intro" :aria-label="`About ${site.name}`">
    <ArchiveBlocks :page="archive" />
  </section>
  <ContentPending v-else-if="!hasText" :what="`The page about ${site.name}`" />

  <section v-if="hasText || glance.length" class="detail-layout">
    <article>
      <template v-if="content?.about?.length">
        <h2>About the site</h2>
        <ProseBlock :paragraphs="content.about" />
      </template>
      <template v-if="content?.habitatsAndWildlife?.length">
        <h2>Habitats &amp; wildlife</h2>
        <ProseBlock :paragraphs="content.habitatsAndWildlife" />
      </template>
    </article>
    <aside v-if="glance.length" class="fact-panel" aria-labelledby="glance-title">
      <p id="glance-title" class="eyebrow">AT A GLANCE</p>
      <dl>
        <template v-for="d in glance" :key="d.term">
          <dt>{{ d.term }}</dt>
          <dd>{{ d.value }}</dd>
        </template>
      </dl>
    </aside>
  </section>

  <section v-if="seen.length" class="page-column" aria-labelledby="seen-title">
    <h2 id="seen-title">Species recorded here</h2>
    <ul class="species-list">
      <li v-for="s in seen" :key="s.slug">
        <RouterLink :to="{ name: 'species', params: { group: s.group, species: s.slug } }">
          <span class="species-name">{{ s.commonName }}</span>
          <span class="latin">{{ groupOf(s.group)?.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>

  <section class="access-information" aria-labelledby="access-title">
    <p class="eyebrow">PLAN YOUR VISIT</p>
    <h2 id="access-title">Access information</h2>
    <template v-if="access.length">
      <dl>
        <template v-for="d in access" :key="d.term">
          <dt>{{ d.term }}</dt>
          <dd>{{ d.value }}</dd>
        </template>
      </dl>
      <p v-if="content?.accessInformation?.checkedOn">
        Last checked on {{ formatDate(content.accessInformation.checkedOn) }}.
      </p>
    </template>
    <!-- Pas d'information non vérifiée : des personnes handicapées préparent leur visite avec. -->
    <p v-else>
      Access details for {{ site.name }} have not been checked yet. If you need to know about paths, steps or
      facilities before your visit,
      <RouterLink :to="{ name: 'help', query: { topic: 'accessibility', page: `/places/${site.slug}` } }">
        ask us</RouterLink
      >.
    </p>
  </section>

  <MoreAbout :title="`More about ${site.name}`" :pages="more" />

  <nav class="place-pager" aria-label="Other wildlife sites">
    <RouterLink :to="{ name: 'place', params: { place: previous.slug } }" rel="prev">
      <span aria-hidden="true">←</span> <span class="sr-only">Previous site: </span>{{ previous.name }}
    </RouterLink>
    <RouterLink :to="{ name: 'place', params: { place: next.slug } }" rel="next">
      <span class="sr-only">Next site: </span>{{ next.name }} <span aria-hidden="true">→</span>
    </RouterLink>
  </nav>

  <HelpWithPage />
</template>
