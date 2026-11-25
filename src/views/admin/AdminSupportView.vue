<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatDate } from '@/features/community/format'
import {
  reference,
  STATUSES,
  supportService,
  TOPICS,
  type Status,
  type SupportRequest,
} from '@/features/support/support'

const requests = ref<SupportRequest[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const filter = ref<'active' | 'closed' | 'all'>('active')
const status = ref('')

const visible = computed(() =>
  requests.value
    .filter((r) => filter.value === 'all' || (filter.value === 'closed') === (r.status === 'closed'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

async function load() {
  state.value = 'loading'
  try {
    requests.value = await supportService.list()
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}
onMounted(load)

async function change(r: SupportRequest, next: Status) {
  try {
    const updated = await supportService.setStatus(r.id, next)
    requests.value = requests.value.map((x) => (x.id === r.id ? updated : x))
    status.value = `Request ${reference(r.id)} is now “${STATUSES[next]}”.`
  } catch {
    status.value = `Request ${reference(r.id)} could not be updated. Please try again.`
  }
}
</script>

<template>
  <h1>Help requests</h1>

  <fieldset class="choice-row">
    <legend>Show</legend>
    <label><input v-model="filter" type="radio" name="filter" value="active" /> To handle</label>
    <label><input v-model="filter" type="radio" name="filter" value="closed" /> Closed</label>
    <label><input v-model="filter" type="radio" name="filter" value="all" /> All</label>
  </fieldset>

  <p role="status">{{ status }}</p>

  <p v-if="state === 'loading'">Loading requests…</p>
  <p v-else-if="state === 'error'" role="alert">
    The requests could not be loaded. <button type="button" @click="load">Try again</button>
  </p>
  <p v-else-if="!visible.length">No requests here.</p>
  <ul v-else class="request-list">
    <li v-for="r in visible" :key="r.id">
      <h2>{{ r.subject }}</h2>
      <p class="article-meta">
        {{ reference(r.id) }} · {{ TOPICS[r.topic] }} · {{ formatDate(r.createdAt) }} ·
        <strong>{{ STATUSES[r.status] }}</strong>
      </p>
      <p class="preserve-lines">{{ r.description }}</p>
      <p v-if="r.page">Page: {{ r.page }}</p>
      <p v-if="r.email">
        Reply to: <a :href="`mailto:${r.email}?subject=${encodeURIComponent('Re: ' + r.subject)}`">{{ r.email }}</a>
      </p>
      <p v-else>No email given: the visitor follows the status on the help page.</p>
      <div class="request-actions">
        <button v-if="r.status === 'open'" type="button" @click="change(r, 'in_progress')">
          Mark as being handled<span class="sr-only">: {{ r.subject }}</span>
        </button>
        <button v-if="r.status !== 'closed'" class="primary" type="button" @click="change(r, 'closed')">
          Close<span class="sr-only"> request: {{ r.subject }}</span>
        </button>
        <button v-else type="button" @click="change(r, 'open')">
          Reopen<span class="sr-only"> request: {{ r.subject }}</span>
        </button>
      </div>
    </li>
  </ul>
</template>
