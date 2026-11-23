<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import AccessibilityDialog from '@/components/layout/AccessibilityDialog.vue'
import { openReadingPreferences, registerPreferencesDialog } from '@/features/accessibility/dialog'

const route = useRoute()
const accessibility = ref<InstanceType<typeof AccessibilityDialog> | null>(null)

onMounted(() => registerPreferencesDialog(() => accessibility.value?.open()))
</script>

<template>
  <a class="skip" href="#main">Skip to content</a>
  <SiteHeader @open-accessibility="openReadingPreferences" />
  <main id="main" tabindex="-1" :class="route.meta.mainClass">
    <RouterView />
  </main>
  <SiteFooter />
  <AccessibilityDialog ref="accessibility" />
</template>
