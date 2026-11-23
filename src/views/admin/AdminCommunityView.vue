<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { communityService, isExamplePost } from '@/features/community/service'
import { postMeta } from '@/features/community/format'
import type { CommunityPost } from '@/features/community/types'

const posts = ref<CommunityPost[]>([])
const page = ref(1)
const hasNext = ref(false)
const state = ref<'loading' | 'ready' | 'error'>('loading')
const status = ref('')
const confirmingId = ref<string | null>(null)

async function load() {
  state.value = 'loading'
  try {
    const result = await communityService.list({ page: page.value })
    posts.value = result.posts
    hasNext.value = result.hasNext
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(load)

async function go(delta: number) {
  page.value += delta
  await load()
}

async function remove(post: CommunityPost) {
  try {
    await communityService.remove(post.id)
    posts.value = posts.value.filter((p) => p.id !== post.id)
    status.value = `“${post.title}” has been removed from the journal.`
  } catch {
    status.value = `“${post.title}” could not be removed.`
  }
  confirmingId.value = null
}
</script>

<template>
  <h1>Community journal</h1>
  <p>Remove notes that are offensive, off-topic, advertising, or that share someone's personal information.</p>

  <p role="status">{{ status }}</p>

  <p v-if="state === 'loading'">Loading notes…</p>
  <p v-else-if="state === 'error'" role="alert">
    The journal could not be loaded. <button type="button" @click="load">Try again</button>
  </p>
  <p v-else-if="!posts.length">The journal is empty.</p>
  <ul v-else class="request-list">
    <li v-for="post in posts" :key="post.id">
      <h2>
        <RouterLink :to="{ name: 'community-article', params: { id: post.id } }">{{ post.title }}</RouterLink>
      </h2>
      <p class="article-meta">{{ postMeta(post) }}</p>
      <p v-if="isExamplePost(post.id)">Example note shown in demo mode. It cannot be removed.</p>
      <template v-else-if="confirmingId === post.id">
        <p><strong>Remove this note permanently?</strong></p>
        <button class="danger-button" type="button" @click="remove(post)">
          Yes, remove<span class="sr-only"> “{{ post.title }}”</span>
        </button>
        {{ ' ' }}
        <button type="button" @click="confirmingId = null">Cancel</button>
      </template>
      <button v-else class="danger-button" type="button" @click="confirmingId = post.id">
        Remove<span class="sr-only"> “{{ post.title }}”</span>
      </button>
    </li>
  </ul>

  <nav v-if="page > 1 || hasNext" aria-label="Journal pages">
    <button v-if="page > 1" type="button" @click="go(-1)">Newer notes</button>
    {{ ' ' }}
    <button v-if="hasNext" type="button" @click="go(1)">Older notes</button>
  </nav>
</template>
