<script setup lang="ts">
import type { Photo } from '@/content/types'

defineProps<{ photo: Photo; eager?: boolean }>()
</script>

<template>
  <figure class="content-photo">
    <img
      :src="photo.src"
      :alt="photo.alt"
      :width="photo.width"
      :height="photo.height"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
    />
    <figcaption v-if="photo.caption || photo.credit">
      {{ photo.caption }}
      <span v-if="photo.credit" class="photo-credit">Photo: {{ photo.credit }}</span>
    </figcaption>
  </figure>
</template>
