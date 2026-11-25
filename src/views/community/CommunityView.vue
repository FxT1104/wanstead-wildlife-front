<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { communityService } from '@/features/community/service'
import { COMMUNITY_CATEGORIES, type CommunityPage } from '@/features/community/types'
import { excerpt, parseCategories } from '@/features/community/validation'
import { postMeta } from '@/features/community/format'
import PenIcon from '@/components/icons/PenIcon.vue'

const route = useRoute()
const router = useRouter()

const selected = computed(() => parseCategories(route.query.category))
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page ?? '1'), 10) || 1))

// Copie modifiable des cases cochées, appliquée seulement à l'envoi du formulaire.
const checked = ref<string[]>([...selected.value])
const result = ref<CommunityPage | null>(null)
const loading = ref(true)
const error = ref('')

watch(
  [selected, page],
  async () => {
    checked.value = [...selected.value]
    loading.value = true
    error.value = ''
    try {
      result.value = await communityService.list({ categories: selected.value, page: page.value })
    } catch {
      result.value = null
      error.value = 'The journal is temporarily unavailable. Please try again later.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function applyFilters() {
  router.push({ query: checked.value.length ? { category: checked.value } : {} })
}

function pageLink(n: number) {
  return { query: { ...route.query, page: n > 1 ? String(n) : undefined } }
}

const emptyMessage = computed(() =>
  page.value > 1
    ? 'No more articles.'
    : selected.value.length
      ? 'No articles in these categories yet.'
      : 'The journal is open for its first field note.',
)
</script>

<template>
  <div class="journal-masthead">
    <div>
      <h1>Community journal</h1>
      <p>Field notes from people exploring Wanstead.</p>
    </div>
    <RouterLink class="journal-write" :to="{ name: 'community-write' }"><PenIcon />Write an article</RouterLink>
  </div>

  <form class="journal-filters" @submit.prevent="applyFilters">
    <fieldset>
      <legend>Filter by category</legend>
      <div>
        <label v-for="c in COMMUNITY_CATEGORIES" :key="c">
          <input v-model="checked" type="checkbox" name="category" :value="c" />{{ c }}
        </label>
      </div>
    </fieldset>
    <button type="submit">Apply filters</button>
    <RouterLink v-if="selected.length" :to="{ name: 'community' }">Show all articles</RouterLink>
  </form>

  <p v-if="loading" role="status">Loading articles…</p>
  <p v-else-if="error" role="alert">{{ error }}</p>
  <template v-else-if="result">
    <ul v-if="result.posts.length" class="journal-list">
      <li
        v-for="post in result.posts"
        :key="post.id"
        :class="post.photoUrl ? 'journal-with-photo' : 'journal-text-note'"
      >
        <img v-if="post.photoUrl" loading="lazy" decoding="async" :src="post.photoUrl" :alt="post.photoAlt ?? ''" />
        <div class="note-copy">
          <h2>
            <RouterLink :to="{ name: 'community-article', params: { id: post.id } }">{{ post.title }}</RouterLink>
          </h2>
          <p class="note-excerpt">{{ excerpt(post.body) }}</p>
          <p class="article-meta">{{ postMeta(post) }}</p>
        </div>
      </li>
    </ul>
    <p v-else>{{ emptyMessage }}</p>

    <nav v-if="page > 1 || result.hasNext" aria-label="Journal pages">
      <RouterLink v-if="page > 1" class="back" :to="pageLink(page - 1)">Newer articles</RouterLink>
      {{ ' ' }}
      <RouterLink v-if="result.hasNext" class="back" :to="pageLink(page + 1)">Older articles</RouterLink>
    </nav>
  </template>
</template>
