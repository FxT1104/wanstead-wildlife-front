<script setup lang="ts">
import ExploreCover from '@/components/content/ExploreCover.vue'
import type { ExploreItem } from '@/components/content/explore'
import { places } from '@/data/catalogue'

const items: ExploreItem[] = places.map((p) => ({
  key: p.slug,
  title: p.name,
  to: { name: 'place', params: { place: p.slug } },
}))
</script>

<template>
  <ExploreCover
    section="Wildlife Sites"
    title="Places to"
    title-emphasis="discover."
    art="/assets/parkland-atlas.webp"
    explore-label="Explore places"
    search-label="Find a place"
    search-placeholder="Search by name"
    :noun="['place', 'places']"
    :items="items"
  />
</template>
