<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  archiveSearchItems,
  isSearchKind,
  search,
  searchCatalogue,
  type SearchItem,
  type SearchKind,
} from '@/features/search/search'
import { loadArchiveIndex } from '@/content/archive'

const route = useRoute()
const router = useRouter()

const query = ref('')
const kind = ref<SearchKind | 'all'>('all')

// L'URL est la source de vérité : ?q=...&kind=... (partageable, bouton Retour).
watch(
  () => route.query,
  (q) => {
    query.value = typeof q.q === 'string' ? q.q : ''
    kind.value = isSearchKind(q.kind) ? q.kind : 'all'
  },
  { immediate: true },
)

const submittedQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const submittedKind = computed(() => (isSearchKind(route.query.kind) ? route.query.kind : 'all'))
// Pages migrées : chargées à l'ouverture de la recherche (index léger).
const archiveItems = ref<SearchItem[]>([])
onMounted(async () => {
  archiveItems.value = archiveSearchItems(await loadArchiveIndex())
})

const results = computed(() =>
  search([...searchCatalogue, ...archiveItems.value], submittedQuery.value, submittedKind.value),
)

const statusText = computed(() => {
  const n = results.value.length
  const what = `${n} ${n === 1 ? 'page' : 'pages'} found`
  return submittedQuery.value ? `${what} for “${submittedQuery.value}”.` : `${what}.`
})

const kindLabel: Record<SearchKind, string> = { wildlife: 'Wildlife', places: 'Places', information: 'Information' }

function submit() {
  const q: Record<string, string> = {}
  if (query.value.trim()) q.q = query.value.trim()
  if (kind.value !== 'all') q.kind = kind.value
  router.replace({ query: q })
}
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">FIND YOUR WAY</p>
    <h1>Search Wanstead Wildlife</h1>
  </section>

  <section class="utility-content">
    <form class="search-form" role="search" @submit.prevent="submit">
      <label for="search-q">Species, group or place</label>
      <input id="search-q" v-model="query" type="search" name="q" placeholder="Try frog or Wanstead Park" />

      <label for="search-kind">Show</label>
      <select id="search-kind" v-model="kind" name="kind" @change="submit">
        <option value="all">All pages</option>
        <option value="wildlife">Wildlife</option>
        <option value="places">Places</option>
        <option value="information">Information</option>
      </select>

      <button class="primary" type="submit">Search</button>
    </form>

    <p id="search-status" role="status">{{ statusText }}</p>

    <ul v-if="results.length" class="search-results" aria-labelledby="search-status">
      <li v-for="item in results" :key="JSON.stringify(item.to)">
        <RouterLink class="search-result" :to="item.to">
          <span class="result-kind">{{ kindLabel[item.kind] }}</span>
          <span class="result-title">{{ item.title }}</span>
          <span class="result-description">{{ item.description }}</span>
        </RouterLink>
      </li>
    </ul>
    <p v-else>
      No matching pages. Try a common name, or browse <RouterLink to="/wildlife">Wildlife</RouterLink> and
      <RouterLink to="/places">Places</RouterLink>.
    </p>
  </section>
</template>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem;
  max-width: 40rem;
  margin-bottom: 1.5rem;
}
.search-form button {
  justify-self: start;
  margin-top: 0.6rem;
}
.search-results {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.8rem;
  max-width: 48rem;
}
.search-result {
  display: grid;
  gap: 0.2rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
}
.search-result:hover .result-title,
.search-result:focus-visible .result-title {
  text-decoration: underline;
}
.result-kind {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.result-title {
  font: 1.35rem/1.2 Georgia, serif;
}
</style>
