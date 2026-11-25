<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { deleteLocalData, exportLocalData, LOCAL_KEYS } from '@/features/privacy/localData'
import { usePreferences } from '@/features/accessibility/usePreferences'
import { useAuth } from '@/features/auth/useAuth'

const confirming = ref(false)
const status = ref('')
const confirmButton = ref<HTMLButtonElement | null>(null)
const deleteButton = ref<HTMLButtonElement | null>(null)

function download() {
  const blob = new Blob([JSON.stringify(exportLocalData(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wanstead-wildlife-my-data.json'
  a.click()
  URL.revokeObjectURL(url)
  status.value = 'Your data file has been downloaded.'
}

async function askConfirmation() {
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
  const ok = deleteLocalData()
  usePreferences().reset()
  useAuth().logout()
  confirming.value = false
  status.value = ok
    ? 'The data saved on this browser has been deleted. You have been signed out.'
    : 'Some data could not be deleted because browser storage is unavailable.'
  await nextTick()
  deleteButton.value?.focus()
}
</script>

<template>
  <section class="utility-intro">
    <p class="eyebrow">YOUR DATA, YOUR CHOICE</p>
    <h1>Keep control of your information.</h1>
    <p class="intro-copy">What Wanstead Wildlife keeps about you, and how to get a copy or delete it.</p>
  </section>

  <section class="utility-content reading-layout">
    <article>
      <h2>If you have an account</h2>
      <p>
        We keep your email address, your display name and the date your account was created. Your password is stored
        only in an encrypted form that nobody can read. You can see and delete your account at any time from
        <RouterLink to="/account">My account</RouterLink>. Deleting it removes your personal data.
      </p>

      <h2>If you publish in the community journal</h2>
      <p>
        Your article, its photo and description, the place and the display name you choose are public. Do not use
        your full name if you do not want to be identified. To have an article removed, use the
        <RouterLink :to="{ name: 'help', query: { topic: 'content' } }">help form</RouterLink>.
      </p>

      <h2>What this browser keeps</h2>
      <ul>
        <li v-for="item in LOCAL_KEYS" :key="item.key">{{ item.label }}</li>
      </ul>
      <p>We do not use advertising or tracking cookies, and we never sell your data.</p>

      <h2>Download your data</h2>
      <p>Get a file with the preferences, articles and requests saved on this browser.</p>
      <button type="button" @click="download">Download my data</button>

      <h2>Delete the data on this browser</h2>
      <p>
        This removes your preferences, demo articles and requests from this browser, and signs you out. It does not
        delete your account or articles already published on the website.
      </p>
      <button v-if="!confirming" ref="deleteButton" class="danger-button" type="button" @click="askConfirmation">
        Delete data on this browser
      </button>
      <div v-else role="group" aria-labelledby="confirm-delete">
        <p id="confirm-delete"><strong>Delete the data saved on this browser? This cannot be undone.</strong></p>
        <button ref="confirmButton" class="danger-button" type="button" @click="confirmDelete">Yes, delete</button>
        {{ ' ' }}
        <button type="button" @click="cancel">Cancel</button>
      </div>

      <p role="status">{{ status }}</p>

      <h2>Your rights</h2>
      <p>
        Under the UK GDPR you can ask for a copy of your data, its correction or its deletion. Contact us through the
        <RouterLink :to="{ name: 'help', query: { topic: 'support' } }">help form</RouterLink>.
      </p>
    </article>

    <aside class="side-note" aria-labelledby="privacy-principle">
      <p class="eyebrow">PRIVACY BY DESIGN</p>
      <h2 id="privacy-principle">Only what is needed.</h2>
      <p>Most of the site works without an account. We only ask for what a feature really needs.</p>
    </aside>
  </section>
</template>
