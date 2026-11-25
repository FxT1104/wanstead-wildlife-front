<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ErrorSummary from '@/components/forms/ErrorSummary.vue'
import { useAuth } from '@/features/auth/useAuth'
import { describedBy, errorFor, fromApiError, type SummaryError } from '@/features/forms/errors'

const router = useRouter()
const { register } = useAuth()

const form = reactive({ displayName: '', email: '', password: '', consent: false })
const errors = ref<SummaryError[]>([])
const message = ref('')
const busy = ref(false)
const summary = ref<InstanceType<typeof ErrorSummary> | null>(null)

// Règles alignées sur l'entité User de l'API (displayName obligatoire, mot de passe 8 caractères minimum).
function validate(): SummaryError[] {
  const e: SummaryError[] = []
  if (!form.displayName.trim()) e.push({ field: 'displayName', message: 'Enter a display name.' })
  else if (form.displayName.trim().length > 100)
    e.push({ field: 'displayName', message: 'Use 100 characters or fewer for your display name.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    e.push({ field: 'email', message: 'Enter an email address like name@example.com.' })
  if (form.password.length < 8) e.push({ field: 'password', message: 'Use at least 8 characters for your password.' })
  if (!form.consent)
    e.push({ field: 'consent', message: 'Confirm that you have read how we use your data.' })
  return e
}

async function submit() {
  message.value = ''
  errors.value = validate()
  if (errors.value.length) return summary.value?.focus()

  busy.value = true
  try {
    await register({ displayName: form.displayName.trim(), email: form.email.trim(), plainPassword: form.password })
    await router.replace({ name: 'account', query: { welcome: '1' } })
  } catch (error) {
    ;({ errors: errors.value, message: message.value } = fromApiError(
      error,
      'Your account could not be created at the moment. Please try again later.',
      { plainPassword: 'password' },
    ))
    summary.value?.focus()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">YOUR ACCOUNT</p>
    <h1>Create an account</h1>
  </section>

  <section class="utility-content account-form">
    <ErrorSummary ref="summary" :errors="errors" :message="message" />

    <form novalidate @submit.prevent="submit">
      <label for="displayName">Display name</label>
      <p id="displayName-hint" class="field-hint">Shown with your contributions. It does not have to be your real name.</p>
      <p v-if="errorFor(errors, 'displayName')" id="displayName-error" class="field-error">
        {{ errorFor(errors, 'displayName') }}
      </p>
      <input
        id="displayName"
        v-model="form.displayName"
        name="displayName"
        autocomplete="nickname"
        maxlength="100"
        required
        :aria-invalid="!!errorFor(errors, 'displayName')"
        :aria-describedby="describedBy(errors, 'displayName', 'displayName-hint')"
      />

      <label for="email">Email address</label>
      <p v-if="errorFor(errors, 'email')" id="email-error" class="field-error">{{ errorFor(errors, 'email') }}</p>
      <input
        id="email"
        v-model="form.email"
        type="email"
        name="email"
        autocomplete="email"
        spellcheck="false"
        required
        :aria-invalid="!!errorFor(errors, 'email')"
        :aria-describedby="describedBy(errors, 'email')"
      />

      <label for="password">Password</label>
      <p id="password-hint" class="field-hint">At least 8 characters. A short sentence is easy to remember.</p>
      <p v-if="errorFor(errors, 'password')" id="password-error" class="field-error">
        {{ errorFor(errors, 'password') }}
      </p>
      <input
        id="password"
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="new-password"
        required
        :aria-invalid="!!errorFor(errors, 'password')"
        :aria-describedby="describedBy(errors, 'password', 'password-hint')"
      />

      <p v-if="errorFor(errors, 'consent')" id="consent-error" class="field-error">{{ errorFor(errors, 'consent') }}</p>
      <label class="check-row" for="consent">
        <input
          id="consent"
          v-model="form.consent"
          type="checkbox"
          name="consent"
          :aria-invalid="!!errorFor(errors, 'consent')"
          :aria-describedby="describedBy(errors, 'consent')"
        />
        I have read <RouterLink to="/privacy" target="_blank">how my data is used (opens in a new tab)</RouterLink>.
      </label>

      <button class="primary" type="submit" :disabled="busy">
        {{ busy ? 'Creating your account…' : 'Create account' }}
      </button>
    </form>

    <p>Already have an account? <RouterLink :to="{ name: 'login' }">Sign in</RouterLink></p>
  </section>
</template>
