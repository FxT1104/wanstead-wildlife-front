<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="community-invite" aria-labelledby="community-invite-title">
    <div>
      <p class="eyebrow">COMMUNITY JOURNAL</p>
      <h2 id="community-invite-title">What did you spot?</h2>
      <p>Share a field note from your visit to Wanstead.</p>
    </div>
    <div>
      <RouterLink class="visit-place" :to="{ name: 'community-write' }">Write an article</RouterLink>
      <RouterLink class="text-link" :to="{ name: 'community' }">Read the journal</RouterLink>
    </div>
  </section>
</template>
