<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppBreadcrumb from '@/components/content/AppBreadcrumb.vue'
import ContentPending from '@/components/content/ContentPending.vue'
import HelpWithPage from '@/components/content/HelpWithPage.vue'
import ArchiveBlocks from '@/components/content/ArchiveBlocks.vue'
import MoreAbout from '@/components/content/MoreAbout.vue'
import { useArchiveFor, useHomedPages } from '@/content/archive'
import { groupOf, speciesInGroup } from '@/content'
import { normalise } from '@/data/catalogue'

const props = defineProps<{ group: string }>()

// Texte d'introduction migré depuis le site actuel (s'il existe)
const archive = useArchiveFor('group', () => props.group)
const more = useHomedPages('group', () => props.group)

// La route vérifie déjà que le groupe existe (beforeEnter).
const info = computed(() => groupOf(props.group)!)
const all = computed(() => speciesInGroup(props.group))

const query = ref('')
const filtered = computed(() => {
  const q = normalise(query.value)
  return q
    ? all.value.filter((s) => normalise(`${s.commonName} ${s.scientificName ?? ''} ${s.family ?? ''}`).includes(q))
    : all.value
})
const countLabel = computed(() => {
  const n = filtered.value.length
  return `${n} species shown`
})
</script>

<template>
  <AppBreadcrumb
    :items="[
      { label: 'Home', to: '/' },
      { label: 'Wildlife', to: '/wildlife' },
      { label: info.name },
    ]"
  />

  <section class="specimen-sheet">
    <figure>
      <!-- Illustration d'ambiance : la légende donne l'exemple montré. -->
      <img :src="`/assets/groups/${info.slug}.webp`" alt="" width="640" height="640" />
      <figcaption>{{ info.example }}</figcaption>
    </figure>
    <div>
      <p class="eyebrow">WILDLIFE GROUP</p>
      <h1>{{ info.name }}</h1>
      <p v-if="all.length" class="specimen-note">
        {{ all.length }} {{ all.length === 1 ? 'species is' : 'species are' }} recorded in this group.
      </p>
    </div>
  </section>

  <section v-if="archive" class="page-column archive-intro" :aria-label="`About ${info.name.toLowerCase()}`">
    <ArchiveBlocks :page="archive" />
  </section>

  <!-- Fiches structurées ; sans fiche ni contenu migré, on annonce que le contenu arrive. -->
  <section v-if="all.length || (!archive && !more.length)" class="page-column" aria-labelledby="species-list-title">
    <h2 id="species-list-title">Species</h2>

    <template v-if="all.length">
      <div v-if="all.length > 8" class="species-filter">
        <label for="species-query">Find a species in {{ info.name }}</label>
        <input id="species-query" v-model="query" type="search" autocomplete="off" />
        <p role="status">{{ countLabel }}</p>
      </div>
      <ul class="species-list">
        <li v-for="s in filtered" :key="s.slug">
          <RouterLink :to="{ name: 'species', params: { group: info.slug, species: s.slug } }">
            <span class="species-name">{{ s.commonName }}</span>
            <span v-if="s.scientificName" class="latin">{{ s.scientificName }}</span>
          </RouterLink>
        </li>
      </ul>
      <p v-if="!filtered.length">No species match “{{ query }}”.</p>
    </template>
    <ContentPending v-else :what="`The list of ${info.name.toLowerCase()}`" />
  </section>

  <MoreAbout :title="`More about ${info.name.toLowerCase()}`" :pages="more" />

  <HelpWithPage />
</template>
