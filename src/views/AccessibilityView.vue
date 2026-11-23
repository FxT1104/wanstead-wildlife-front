<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { openReadingPreferences } from '@/features/accessibility/dialog'
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">OPEN TO EVERYONE</p>
    <h1>A more comfortable way to explore.</h1>
    <p class="intro-copy">
      Adjust the display to suit you, or use the controls provided by your browser and assistive technology.
    </p>
  </section>

  <section class="utility-content reading-layout">
    <article>
      <h2>Your reading preferences</h2>
      <p>
        Choose a larger text size, higher contrast, a neutral palette, more space between lines, a simpler heading
        font or reduced motion. Your choices stay on this browser and can be reset at any time.
      </p>
      <button class="primary" type="button" aria-haspopup="dialog" @click="openReadingPreferences">
        Open reading preferences
      </button>

      <h2>Finding your way</h2>
      <p>
        Every page has the same main navigation. Use <RouterLink to="/search">Search</RouterLink> to find a wildlife
        group, a place or a page. The first link of each page, “Skip to content”, goes straight to the main content.
      </p>

      <h2>Keyboard access</h2>
      <p>
        Use <kbd>Tab</kbd> to move between links and controls, <kbd>Shift</kbd> + <kbd>Tab</kbd> to go back and
        <kbd>Enter</kbd> to follow a link. <kbd>Escape</kbd> closes the reading preferences, the mobile menu and the
        wildlife finder.
      </p>

      <h2>Photos</h2>
      <p>
        Photos that carry information have a text description. When you publish in the community journal, a
        description is required for every photo.
      </p>

      <h2>Accessibility status</h2>
      <p>
        This website aims to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It has not yet been
        fully audited. An audit with automated tools and screen readers, and tests with disabled people, are planned
        before the site is delivered. Until then we cannot claim full conformance.
      </p>
      <p>Known limitations: some pages are still being built and some photographs are temporary illustrations.</p>

      <h2>Something is difficult to use?</h2>
      <p>Tell us what happened and on which page. We will reply and keep you informed until the problem is fixed.</p>
      <RouterLink class="underlined" :to="{ name: 'help', query: { topic: 'accessibility' } }">
        Report an accessibility problem
      </RouterLink>
    </article>

    <aside class="side-note" aria-labelledby="browser-tips">
      <p class="eyebrow">DESIGNED FOR CHOICE</p>
      <h2 id="browser-tips">Your browser works too.</h2>
      <p>You can zoom in, increase your system text size and choose reduced motion in your device settings.</p>
    </aside>
  </section>
</template>
