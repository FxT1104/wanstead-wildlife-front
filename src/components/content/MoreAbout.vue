<script setup lang="ts">
/** Pages migrées rangées sous une page du site : « More about Insects », « More about Wanstead Park »… */
import { computed, ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import type { ArchiveEntry } from '@/content/types'
import { normalise } from '@/data/catalogue'

const props = defineProps<{ title: string; pages: ArchiveEntry[] }>()
const id = useId()
const query = ref('')

const visible = computed(() => {
  const q = normalise(query.value)
  return q ? props.pages.filter((p) => normalise(p.title).includes(q)) : props.pages
})
</script>

<template>
  <section v-if="pages.length" class="page-column more-about" :aria-labelledby="`${id}-title`">
    <h2 :id="`${id}-title`">{{ title }}</h2>
    <div v-if="pages.length > 10" class="species-filter">
      <label :for="`${id}-filter`">Find a page</label>
      <input :id="`${id}-filter`" v-model="query" type="search" autocomplete="off" />
      <p role="status">{{ visible.length }} of {{ pages.length }} pages</p>
    </div>
    <ul class="species-list">
      <li v-for="p in visible" :key="p.slug">
        <RouterLink :to="{ name: 'archive-page', params: { slug: p.slug } }">
          <span class="species-name">{{ p.title }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
