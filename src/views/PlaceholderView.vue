<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Page provisoire : structure accessible (une seule H1) en attendant le contenu migré.
defineProps<{ heading: string; notFound?: boolean; forbidden?: boolean }>()
</script>

<template>
  <section class="template-intro">
    <h1>{{ heading }}</h1>
    <p v-if="notFound">
      This page does not exist. <RouterLink to="/">Go back to the home page</RouterLink> or
      <RouterLink to="/search">search the site</RouterLink>.
    </p>
    <p v-else-if="forbidden">
      This area is reserved for the site's administrators. <RouterLink to="/">Go back to the home page</RouterLink>.
    </p>
    <p v-else>This page is being built. Existing content from Wanstead Wildlife will be added here.</p>
  </section>
</template>
