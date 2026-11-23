<script setup lang="ts">
import ExploreCover from '@/components/content/ExploreCover.vue'
import type { ExploreItem } from '@/components/content/explore'
import { wildlifeGroups } from '@/data/catalogue'

const items: ExploreItem[] = wildlifeGroups.map((g) => ({
  key: g.slug,
  title: g.name,
  detail: `Example: ${g.example}`,
  image: `/assets/groups/${g.slug}.webp`,
  to: { name: 'wildlife-group', params: { group: g.slug } },
}))
</script>

<template>
  <ExploreCover
    section="Wildlife"
    title="The living"
    title-emphasis="landscape."
    art="/assets/wanstead-fieldbook.webp"
    explore-label="Explore wildlife"
    search-label="Find a wildlife group"
    search-placeholder="Search by group or example"
    :noun="['group', 'groups']"
    :items="items"
  />
</template>
