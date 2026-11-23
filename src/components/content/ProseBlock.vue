<script setup lang="ts">
/** Paragraphes en texte brut (jamais interprétés comme du HTML). */
defineProps<{ paragraphs: string[] }>()
</script>

<template>
  <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
</template>
