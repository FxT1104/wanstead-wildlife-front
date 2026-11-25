<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'

/** Le dernier élément est la page courante (sans lien). */
defineProps<{ items: { label: string; to?: RouteLocationRaw }[] }>()
</script>

<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <template v-for="(item, i) in items" :key="item.label">
      <span v-if="i > 0" aria-hidden="true">/</span>
      <RouterLink v-if="item.to && i < items.length - 1" :to="item.to">{{ item.label }}</RouterLink>
      <span v-else aria-current="page">{{ item.label }}</span>
    </template>
  </nav>
</template>
