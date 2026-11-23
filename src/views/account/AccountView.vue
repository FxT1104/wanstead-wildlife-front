<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/client'
import type { User } from '@/api/types'
import { useAuth } from '@/features/auth/useAuth'
import { formatDate } from '@/features/community/format'

const route = useRoute()
const router = useRouter()
const { email, isAdmin, logout, me, deleteAccount } = useAuth()

const user = ref<User | null>(null)
const confirming = ref(false)
const busy = ref(false)
const error = ref('')
const deleteButton = ref<HTMLButtonElement | null>(null)
const confirmButton = ref<HTMLButtonElement | null>(null)

onMounted(async () => {
  try {
    user.value = await me()
  } catch {
    // GET /api/me pas encore disponible : on affiche ce que contient le jeton.
    user.value = null
  }
})

async function signOut() {
  logout()
  await router.push('/')
}

async function askConfirmation() {
  error.value = ''
  confirming.value = true
  await nextTick()
  confirmButton.value?.focus()
}

async function cancel() {
  confirming.value = false
  await nextTick()
  deleteButton.value?.focus()
}

async function confirmDelete() {
  busy.value = true
  try {
    await deleteAccount()
    await router.push({ name: 'home', query: {} })
  } catch (e) {
    confirming.value = false
    error.value =
      e instanceof ApiError && (e.status === 404 || e.status === 405)
        ? 'Account deletion is not available online yet. Please ask for it through the help form and we will delete your account.'
        : 'Your account could not be deleted at the moment. Please try again later.'
    await nextTick()
    deleteButton.value?.focus()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">YOUR ACCOUNT</p>
    <h1>My account</h1>
  </section>

  <section class="utility-content account-form">
    <p v-if="route.query.welcome" role="status" class="success-message">Your account has been created.</p>

    <h2>Your details</h2>
    <dl class="account-details">
      <template v-if="user">
        <dt>Display name</dt>
        <dd>{{ user.displayName }}</dd>
      </template>
      <dt>Email address</dt>
      <dd>{{ user?.email ?? email }}</dd>
      <template v-if="user">
        <dt>Member since</dt>
        <dd>{{ formatDate(user.createdAt) }}</dd>
      </template>
    </dl>

    <p v-if="isAdmin"><RouterLink :to="{ name: 'admin' }">Go to the administration area</RouterLink></p>

    <button type="button" @click="signOut">Sign out</button>

    <h2>Delete your account</h2>
    <p>
      This permanently deletes your account and your personal data, as allowed by the UK GDPR. Articles you published
      in the community journal stay online without your name.
    </p>
    <p v-if="error" role="alert">
      {{ error }}
      <RouterLink :to="{ name: 'help', query: { topic: 'support' } }">Open the help form</RouterLink>
    </p>
    <button v-if="!confirming" ref="deleteButton" class="danger-button" type="button" @click="askConfirmation">
      Delete my account
    </button>
    <div v-else role="group" aria-labelledby="confirm-account-delete">
      <p id="confirm-account-delete"><strong>Delete your account permanently? This cannot be undone.</strong></p>
      <button ref="confirmButton" class="danger-button" type="button" :disabled="busy" @click="confirmDelete">
        {{ busy ? 'Deleting…' : 'Yes, delete my account' }}
      </button>
      {{ ' ' }}
      <button type="button" :disabled="busy" @click="cancel">Cancel</button>
    </div>
  </section>
</template>
