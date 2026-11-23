<script setup lang="ts">
/** Texte migré : liens internes (routeur), liens externes, emphase. Jamais interprété comme du HTML. */
import { RouterLink } from 'vue-router'
import type { Run } from '@/content/types'

defineProps<{ runs: Run[] }>()

const isInternal = (r: Run) => !!r.href && r.href.startsWith('/')
</script>

<template>
  <template v-for="(r, j) in runs" :key="j">
    <RouterLink v-if="isInternal(r)" :to="r.href!"
      >{{ r.text }}<span v-if="r.label" class="sr-only">: {{ r.label }}</span></RouterLink
    >
    <a v-else-if="r.href" :href="r.href" rel="noopener"
      >{{ r.text }}<span v-if="r.label" class="sr-only">: {{ r.label }}</span></a
    >
    <strong v-else-if="r.strong && r.em"><em>{{ r.text }}</em></strong>
    <strong v-else-if="r.strong">{{ r.text }}</strong>
    <em v-else-if="r.em">{{ r.text }}</em>
    <template v-else>{{ r.text }}</template>
  </template>
</template>
