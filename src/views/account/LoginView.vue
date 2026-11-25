<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ErrorSummary from '@/components/forms/ErrorSummary.vue'
import { useAuth } from '@/features/auth/useAuth'
import { ApiError } from '@/api/client'
import { describedBy, errorFor, fromApiError, type SummaryError } from '@/features/forms/errors'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = ref<SummaryError[]>([])
const message = ref('')
const busy = ref(false)
const summary = ref<InstanceType<typeof ErrorSummary> | null>(null)

/** N'accepte qu'un chemin interne pour éviter une redirection ouverte. */
function safeRedirect(): string {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/account'
}

async function submit() {
  message.value = ''
  errors.value = []
  if (!form.email.trim()) errors.value.push({ field: 'email', message: 'Enter your email address.' })
  if (!form.password) errors.value.push({ field: 'password', message: 'Enter your password.' })
  if (errors.value.length) return summary.value?.focus()

  busy.value = true
  try {
    await login({ email: form.email.trim(), password: form.password })
    await router.replace(safeRedirect())
  } catch (error) {
    form.password = ''
    if (error instanceof ApiError && error.status === 401 && /too many/i.test(error.message)) {
      // Blocage temporaire après 5 échecs en 1 minute (API.md § 5) : le dire clairement.
      message.value = 'Too many failed sign-in attempts. Please wait one minute and try again.'
    } else if (error instanceof ApiError && error.status === 401) {
      // Message volontairement vague : ne pas révéler si l'email existe.
      message.value = 'The email address or password is incorrect.'
    } else {
      ;({ errors: errors.value, message: message.value } = fromApiError(
        error,
        'Sign-in is unavailable at the moment. Please try again later.',
      ))
    }
    summary.value?.focus()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">YOUR ACCOUNT</p>
    <h1>Sign in</h1>
    <p class="intro-copy">You do not need an account to read the site or to publish in the community journal.</p>
  </section>

  <section class="utility-content account-form">
    <ErrorSummary ref="summary" :errors="errors" :message="message" />

    <form novalidate @submit.prevent="submit">
      <label for="email">Email address</label>
      <p v-if="errorFor(errors, 'email')" id="email-error" class="field-error">{{ errorFor(errors, 'email') }}</p>
      <input
        id="email"
        v-model="form.email"
        type="email"
        name="email"
        autocomplete="username"
        spellcheck="false"
        required
        :aria-invalid="!!errorFor(errors, 'email')"
        :aria-describedby="describedBy(errors, 'email')"
      />

      <label for="password">Password</label>
      <p v-if="errorFor(errors, 'password')" id="password-error" class="field-error">
        {{ errorFor(errors, 'password') }}
      </p>
      <input
        id="password"
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="current-password"
        required
        :aria-invalid="!!errorFor(errors, 'password')"
        :aria-describedby="describedBy(errors, 'password')"
      />

      <button class="primary" type="submit" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
    </form>

    <p>
      No account yet?
      <RouterLink :to="{ name: 'register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">
        Create an account
      </RouterLink>
    </p>
  </section>
</template>
