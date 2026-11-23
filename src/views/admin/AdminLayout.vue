<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const sections = [
  { name: 'admin', label: 'Overview' },
  { name: 'admin-articles', label: 'Articles' },
  { name: 'admin-support', label: 'Help requests' },
  { name: 'admin-community', label: 'Community journal' },
]
</script>

<template>
  <div class="admin-layout">
    <nav class="admin-nav" aria-label="Administration">
      <RouterLink v-for="s in sections" :key="s.name" :to="{ name: s.name }">{{ s.label }}</RouterLink>
    </nav>
    <div class="admin-content">
      <RouterView />
    </div>
  </div>
</template>
