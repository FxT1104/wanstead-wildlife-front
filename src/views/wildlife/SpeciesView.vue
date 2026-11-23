<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import ProseBlock from '@/components/content/ProseBlock.vue'
import PhotoFigure from '@/components/content/PhotoFigure.vue'
import RecordsTable from '@/components/content/RecordsTable.vue'
import HelpWithPage from '@/components/content/HelpWithPage.vue'
import { findSpecies, groupOf, placeLabel } from '@/content'

const props = defineProps<{ group: string; species: string }>()

// La route vérifie déjà que le groupe et l'espèce existent (beforeEnter).
const info = computed(() => groupOf(props.group)!)
const s = computed(() => findSpecies(props.group, props.species)!)
const isFlora = computed(() => info.value.profile === 'flora')

const details = computed(() =>
  [
    { term: 'Common name', value: s.value.commonName },
    { term: 'Scientific name', value: s.value.scientificName },
    { term: 'Family', value: s.value.family },
    { term: isFlora.value ? 'Flowering season' : 'Season', value: s.value.season },
  ].filter((d) => d.value),
)
</script>

<template>
  <AppBreadcrumb
    :items="[
      { label: 'Home', to: '/' },
      { label: 'Wildlife', to: '/wildlife' },
      { label: info.name, to: { name: 'wildlife-group', params: { group: info.slug } } },
      { label: s.commonName },
    ]"
  />

  <section class="place-template">
    <div>
      <p class="eyebrow">{{ isFlora ? 'FLORA PROFILE' : 'SPECIES PROFILE' }}</p>
      <h1 class="page-title">{{ s.commonName }}</h1>
      <p v-if="s.scientificName" class="latin">{{ s.scientificName }}</p>
      <ProseBlock v-if="s.intro?.length" :paragraphs="s.intro" />
    </div>
    <PhotoFigure v-if="s.photos?.[0]" :photo="s.photos[0]" eager />
  </section>

  <section class="detail-layout">
    <article>
      <template v-if="s.identification?.length">
        <h2>Identification</h2>
        <ProseBlock :paragraphs="s.identification" />
      </template>
      <template v-if="s.habitat?.length">
        <h2>Habitat</h2>
        <ProseBlock :paragraphs="s.habitat" />
      </template>
      <template v-if="isFlora && s.floweringAndFruiting?.length">
        <h2>Flowering &amp; fruiting</h2>
        <ProseBlock :paragraphs="s.floweringAndFruiting" />
      </template>
      <template v-if="s.places?.length">
        <h2>Where to look</h2>
        <ul>
          <li v-for="p in s.places" :key="p">
            <RouterLink :to="{ name: 'place', params: { place: p } }">{{ placeLabel(p) }}</RouterLink>
          </li>
        </ul>
      </template>
      <template v-if="s.records?.length">
        <h2>Local records</h2>
        <RecordsTable :records="s.records" :caption="`Local records of ${s.commonName}`" />
      </template>
      <template v-if="s.photos && s.photos.length > 1">
        <h2>More photographs</h2>
        <div class="photo-grid">
          <PhotoFigure v-for="photo in s.photos.slice(1)" :key="photo.src" :photo="photo" />
        </div>
      </template>
    </article>

    <aside class="fact-panel" aria-labelledby="facts-title">
      <p id="facts-title" class="eyebrow">{{ isFlora ? 'FLORA DETAILS' : 'SPECIES DETAILS' }}</p>
      <dl>
        <template v-for="d in details" :key="d.term">
          <dt>{{ d.term }}</dt>
          <dd>{{ d.value }}</dd>
        </template>
      </dl>
    </aside>
  </section>

  <HelpWithPage />
</template>
