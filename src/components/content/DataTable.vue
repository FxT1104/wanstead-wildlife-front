<script setup lang="ts">
/**
 * Tableau migré (listes d'espèces, relevés…). Au-delà de 15 lignes :
 * champ de filtre + compteur annoncé aux lecteurs d'écran. En-tête figé au défilement.
 */
import { computed, ref, useId } from 'vue'
import { normalise } from '@/data/catalogue'

const props = defineProps<{ header: string[] | null; rows: string[][]; label: string }>()

const id = useId()
const query = ref('')
const filterable = computed(() => props.rows.length > 15)

const visible = computed(() => {
  const terms = normalise(query.value).split(/\s+/).filter(Boolean)
  if (!terms.length) return props.rows
  return props.rows.filter((row) => {
    const text = normalise(row.join(' '))
    return terms.every((t) => text.includes(t))
  })
})

const status = computed(() =>
  query.value.trim()
    ? `${visible.value.length} of ${props.rows.length} rows match “${query.value.trim()}”`
    : `${props.rows.length} rows`,
)
</script>

<template>
  <div class="data-table">
    <div v-if="filterable" class="data-table-tools">
      <label :for="`${id}-filter`">Filter this table</label>
      <input :id="`${id}-filter`" v-model="query" type="search" autocomplete="off" placeholder="e.g. a species name" />
      <p :id="`${id}-status`" role="status">{{ status }}</p>
    </div>
    <div class="table-scroll" role="region" :aria-label="label" tabindex="0">
      <table class="records-table">
        <caption class="sr-only">{{ label }}</caption>
        <thead v-if="header">
          <tr>
            <th v-for="(h, i) in header" :key="i" scope="col">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in visible" :key="i">
            <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
          </tr>
          <tr v-if="!visible.length">
            <td :colspan="header?.length ?? rows[0]?.length ?? 1">No rows match your filter.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
