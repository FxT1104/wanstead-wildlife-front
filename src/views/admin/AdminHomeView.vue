<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supportService } from '@/features/support/support'

const openRequests = ref<number | null>(null)

onMounted(async () => {
  try {
    openRequests.value = (await supportService.list()).filter((r) => r.status !== 'closed').length
  } catch {
    openRequests.value = null
  }
})
</script>

<template>
  <h1>Administration</h1>
  <ul class="admin-cards">
    <li>
      <h2><RouterLink :to="{ name: 'admin-article-new' }">Write an article</RouterLink></h2>
      <p>Add a new article, save it as a draft or publish it straight away.</p>
    </li>
    <li>
      <h2><RouterLink :to="{ name: 'admin-articles' }">Manage articles</RouterLink></h2>
      <p>Edit, publish, unpublish or delete existing articles.</p>
    </li>
    <li>
      <h2><RouterLink :to="{ name: 'admin-support' }">Help requests</RouterLink></h2>
      <p v-if="openRequests !== null">
        {{ openRequests }} {{ openRequests === 1 ? 'request is' : 'requests are' }} waiting for an answer.
      </p>
      <p v-else>Questions and problems sent by visitors.</p>
    </li>
    <li>
      <h2><RouterLink :to="{ name: 'admin-community' }">Community journal</RouterLink></h2>
      <p>Remove field notes that break the rules.</p>
    </li>
  </ul>
</template>
