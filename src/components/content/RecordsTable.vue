<script setup lang="ts">
import type { Observation } from '@/content/types'
import { placeLabel } from '@/content'

defineProps<{ records: Observation[]; caption: string }>()
</script>

<template>
  <div class="table-scroll" role="region" :aria-label="caption" tabindex="0">
    <table class="records-table">
      <caption>{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Location</th>
          <th scope="col">Observation</th>
          <th scope="col">Observer</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in records" :key="i">
          <td>{{ r.date }}</td>
          <td>{{ placeLabel(r.location) }}</td>
          <td>{{ r.observation }}</td>
          <td>{{ r.observer ?? '' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
