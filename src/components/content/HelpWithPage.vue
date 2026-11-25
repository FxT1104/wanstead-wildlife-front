<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="profile-actions" aria-labelledby="page-help">
    <h2 id="page-help">Need help with this page?</h2>
    <RouterLink :to="{ name: 'help', query: { topic: 'content', page: route.fullPath } }">
      Ask a question or report an error
    </RouterLink>
  </section>
</template>
