<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { communityService } from '@/features/community/service'
import { postMeta } from '@/features/community/format'
import type { CommunityPost } from '@/features/community/types'

const props = defineProps<{ id: string }>()
const route = useRoute()

const post = ref<CommunityPost | null>(null)
const state = ref<'loading' | 'ready' | 'not-found' | 'error'>('loading')

watch(
  () => props.id,
  async (id) => {
    state.value = 'loading'
    try {
      post.value = await communityService.get(id)
      state.value = post.value ? 'ready' : 'not-found'
      if (post.value) document.title = `${post.value.title} — Wanstead Wildlife`
    } catch {
      state.value = 'error'
    }
  },
  { immediate: true },
)
</script>

<template>
  <RouterLink class="back" :to="{ name: 'community' }">Community journal</RouterLink>

  <!-- Le titre de niveau 1 existe dans tous les états : la page n'est jamais sans H1. -->
  <h1 v-if="state === 'loading'">Loading article…</h1>
  <template v-else-if="state === 'ready' && post">
    <p v-if="route.query.published" role="status" class="success-message">Your article has been published.</p>
    <article class="community-article">
      <h1>{{ post.title }}</h1>
      <p class="article-meta">{{ postMeta(post) }}</p>
      <img v-if="post.photoUrl" class="journal-photo" :src="post.photoUrl" :alt="post.photoAlt ?? ''" />
      <div class="prose">{{ post.body }}</div>
    </article>
    <RouterLink class="visit-place" :to="{ name: 'community-write' }">Write an article</RouterLink>
  </template>
  <template v-else-if="state === 'not-found'">
    <h1>Article not found</h1>
    <p>This article does not exist or has been removed.</p>
  </template>
  <template v-else>
    <h1>Article unavailable</h1>
    <p role="alert">The journal is temporarily unavailable. Please try again later.</p>
  </template>
</template>
