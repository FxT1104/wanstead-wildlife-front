<script setup lang="ts">
import { RouterLink } from 'vue-router'

/** Affiché tant que le contenu de la page n'a pas été migré depuis le site actuel. */
defineProps<{ what?: string }>()
</script>

<template>
  <div class="content-pending">
    <p>
      <strong>{{ what ?? 'This page' }} is being moved from the current Wanstead Wildlife website.</strong>
      The records and photographs will appear here once they have been checked.
    </p>
    <p>
      Looking for something specific?
      <RouterLink :to="{ name: 'help', query: { topic: 'content' } }">Ask us</RouterLink>.
    </p>
  </div>
</template>
