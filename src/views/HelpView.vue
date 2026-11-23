<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import ErrorSummary from '@/components/forms/ErrorSummary.vue'
import { describedBy, errorFor, fromApiError, type SummaryError } from '@/features/forms/errors'
import { formatDate } from '@/features/community/format'
import {
  isTopic,
  myRequestIds,
  reference,
  rememberRequest,
  STATUSES,
  SUPPORT_LIMITS,
  supportService,
  TOPICS,
  validateSupport,
  type SupportInput,
  type SupportRequest,
} from '@/features/support/support'

const route = useRoute()

const emptyForm = (): SupportInput => ({
  topic: isTopic(route.query.topic) ? route.query.topic : 'support',
  subject: '',
  description: '',
  email: '',
  page: typeof route.query.page === 'string' ? route.query.page : '',
})

const form = reactive<SupportInput>(emptyForm())
const errors = ref<SummaryError[]>([])
const message = ref('')
const busy = ref(false)
const confirmation = ref<SupportRequest | null>(null)
const summary = ref<InstanceType<typeof ErrorSummary> | null>(null)
const confirmationBox = ref<HTMLElement | null>(null)

const mine = ref<SupportRequest[]>([])
const mineError = ref('')

async function loadMine() {
  try {
    mine.value = await supportService.getMany(myRequestIds())
    mineError.value = ''
  } catch {
    mineError.value = 'Your requests cannot be shown at the moment.'
  }
}
onMounted(loadMine)

async function submit() {
  message.value = ''
  errors.value = validateSupport(form)
  if (errors.value.length) return summary.value?.focus()

  busy.value = true
  try {
    const created = await supportService.create(form)
    rememberRequest(created.id)
    confirmation.value = created
    Object.assign(form, emptyForm(), { topic: form.topic })
    await loadMine()
    await nextTick()
    confirmationBox.value?.focus()
  } catch (error) {
    ;({ errors: errors.value, message: message.value } = fromApiError(
      error,
      'Your request could not be sent. Your text is still below; please try again.',
    ))
    summary.value?.focus()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">WE ARE HERE TO HELP</p>
    <h1>A question or something to improve?</h1>
    <p class="intro-copy">Ask a question, report an accessibility problem or point out an error in the content.</p>
  </section>

  <section class="utility-content reading-layout">
    <article>
      <div v-if="confirmation" ref="confirmationBox" class="success-message" role="status" tabindex="-1">
        <p>Thank you, your request has been sent.</p>
        <p>
          Your reference is <strong>{{ reference(confirmation.id) }}</strong>. You can follow it below on this
          browser.
        </p>
      </div>

      <ErrorSummary ref="summary" :errors="errors" :message="message" />

      <form class="community-form" novalidate @submit.prevent="submit">
        <label for="topic">What is it about?</label>
        <select
          id="topic"
          v-model="form.topic"
          name="topic"
          :aria-invalid="!!errorFor(errors, 'topic')"
          :aria-describedby="describedBy(errors, 'topic')"
        >
          <option v-for="(label, key) in TOPICS" :key="key" :value="key">{{ label }}</option>
        </select>

        <label for="subject">Subject</label>
        <p v-if="errorFor(errors, 'subject')" id="subject-error" class="field-error">
          {{ errorFor(errors, 'subject') }}
        </p>
        <input
          id="subject"
          v-model="form.subject"
          name="subject"
          :maxlength="SUPPORT_LIMITS.subject"
          required
          :aria-invalid="!!errorFor(errors, 'subject')"
          :aria-describedby="describedBy(errors, 'subject')"
        />

        <label for="description">What happened?</label>
        <p id="description-hint" class="field-hint">
          Tell us what you were trying to do and what went wrong. Do not include sensitive personal information.
        </p>
        <p v-if="errorFor(errors, 'description')" id="description-error" class="field-error">
          {{ errorFor(errors, 'description') }}
        </p>
        <textarea
          id="description"
          v-model="form.description"
          name="description"
          :maxlength="SUPPORT_LIMITS.description"
          required
          :aria-invalid="!!errorFor(errors, 'description')"
          :aria-describedby="describedBy(errors, 'description', 'description-hint')"
        ></textarea>

        <label for="page">Page concerned (optional)</label>
        <p v-if="errorFor(errors, 'page')" id="page-error" class="field-error">{{ errorFor(errors, 'page') }}</p>
        <input
          id="page"
          v-model="form.page"
          name="page"
          :maxlength="SUPPORT_LIMITS.page"
          :aria-invalid="!!errorFor(errors, 'page')"
          :aria-describedby="describedBy(errors, 'page')"
        />

        <label for="email">Email address (optional)</label>
        <p id="email-hint" class="field-hint">Only if you would like a reply. It is used for nothing else.</p>
        <p v-if="errorFor(errors, 'email')" id="email-error" class="field-error">{{ errorFor(errors, 'email') }}</p>
        <input
          id="email"
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          spellcheck="false"
          :aria-invalid="!!errorFor(errors, 'email')"
          :aria-describedby="describedBy(errors, 'email', 'email-hint')"
        />

        <button class="primary" type="submit" :disabled="busy">{{ busy ? 'Sending…' : 'Send request' }}</button>
      </form>

      <h2>Your requests</h2>
      <p v-if="mineError" role="alert">{{ mineError }}</p>
      <ul v-else-if="mine.length" class="request-list">
        <li v-for="r in mine" :key="r.id">
          <h3>{{ r.subject }}</h3>
          <p>
            Reference {{ reference(r.id) }} · sent {{ formatDate(r.createdAt) }} ·
            <strong>{{ STATUSES[r.status] }}</strong>
          </p>
        </li>
      </ul>
      <p v-else>You have not sent a request from this browser.</p>
    </article>

    <aside class="side-note" aria-labelledby="journey-title">
      <p class="eyebrow">FOLLOW THE JOURNEY</p>
      <h2 id="journey-title">From question to resolution.</h2>
      <p>Each request is read by the site's author and stays visible here until it is closed.</p>
    </aside>
  </section>
</template>
