<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { SummaryError } from '@/features/forms/errors'

defineProps<{ errors: SummaryError[]; message?: string }>()

const box = ref<HTMLElement | null>(null)

/** Le récapitulatif reçoit le focus après une soumission invalide (WCAG 3.3.1). */
async function focus() {
  await nextTick()
  box.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div v-if="errors.length || message" ref="box" class="error-summary" role="alert" tabindex="-1">
    <h2>There is a problem</h2>
    <p v-if="message">{{ message }}</p>
    <ul v-if="errors.length">
      <li v-for="e in errors" :key="e.field + e.message">
        <a :href="`#${e.field}`">{{ e.message }}</a>
      </li>
    </ul>
  </div>
</template>
