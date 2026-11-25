<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="site-footer">
    <div>
      <RouterLink class="footer-brand" to="/">Wanstead Wildlife</RouterLink>
      <p>Wildlife in and around Wanstead.</p>
    </div>
    <nav aria-label="Footer navigation">
      <RouterLink to="/accessibility">Accessibility information</RouterLink>
      <RouterLink to="/help">Help &amp; contact</RouterLink>
      <RouterLink to="/privacy">Your data</RouterLink>
      <RouterLink to="/archive">All pages from the previous website</RouterLink>
    </nav>
    <p>Content and photographs © Paul Ferris.</p>
  </footer>
</template>
