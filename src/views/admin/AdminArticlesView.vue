<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { articles, categories } from '@/api/endpoints'
import type { Article, Category } from '@/api/types'
import { formatDate } from '@/features/community/format'

const list = ref<Article[]>([])
const cats = ref<Category[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const status = ref('')
const confirmingId = ref<number | null>(null)
const heading = ref<HTMLElement | null>(null)

const categoryName = computed(() => {
  const byIri = new Map(cats.value.map((c) => [c['@id'], c.name]))
  return (iri: string) => byIri.get(iri) ?? '—'
})

async function load() {
  state.value = 'loading'
  try {
    const [a, c] = await Promise.all([articles.list(), categories.list()])
    list.value = a.member
    cats.value = c.member
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(load)

async function remove(article: Article) {
  try {
    await articles.remove(article.id)
    list.value = list.value.filter((a) => a.id !== article.id)
    status.value = `“${article.title}” has been deleted.`
  } catch {
    status.value = `“${article.title}” could not be deleted. Please try again.`
  }
  confirmingId.value = null
  await nextTick()
  heading.value?.focus()
}
</script>

<template>
  <h1 ref="heading" tabindex="-1">Articles</h1>
  <p><RouterLink class="primary-link" :to="{ name: 'admin-article-new' }">Write a new article</RouterLink></p>

  <p role="status">{{ status }}</p>

  <p v-if="state === 'loading'">Loading articles…</p>
  <p v-else-if="state === 'error'" role="alert">
    The articles could not be loaded. Check that the API is running, then
    <button type="button" @click="load">try again</button>.
  </p>
  <p v-else-if="!list.length">There are no articles yet.</p>
  <table v-else class="admin-table">
    <caption class="sr-only">
      All articles, newest first
    </caption>
    <thead>
      <tr>
        <th scope="col">Title</th>
        <th scope="col">Category</th>
        <th scope="col">Status</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="a in list" :key="a.id">
        <th scope="row">{{ a.title }}</th>
        <td>{{ categoryName(a.category) }}</td>
        <td>{{ a.publishedAt ? `Published ${formatDate(a.publishedAt)}` : 'Draft' }}</td>
        <td>
          <RouterLink :to="{ name: 'admin-article-edit', params: { id: a.id } }">
            Edit<span class="sr-only"> “{{ a.title }}”</span>
          </RouterLink>
          {{ ' ' }}
          <RouterLink :to="{ name: 'news-article', params: { id: a.id, slug: a.slug } }">
            {{ a.publishedAt ? 'View' : 'Preview' }}<span class="sr-only"> “{{ a.title }}”</span>
          </RouterLink>
          {{ ' ' }}
          <template v-if="confirmingId === a.id">
            <span>Delete permanently?</span>
            <button class="danger-button" type="button" @click="remove(a)">
              Yes, delete<span class="sr-only"> “{{ a.title }}”</span>
            </button>
            <button type="button" @click="confirmingId = null">Cancel</button>
          </template>
          <button v-else class="danger-button" type="button" @click="confirmingId = a.id">
            Delete<span class="sr-only"> “{{ a.title }}”</span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
