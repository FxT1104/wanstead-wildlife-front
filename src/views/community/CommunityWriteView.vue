<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ApiError } from '@/api/client'
import { communityService } from '@/features/community/service'
import { COMMUNITY_CATEGORIES, LIMITS, type CommunityPostInput } from '@/features/community/types'
import { validatePost, type Field, type FieldError } from '@/features/community/validation'

const router = useRouter()

const form = reactive<CommunityPostInput>({
  title: '',
  category: '',
  authorName: '',
  place: '',
  body: '',
  photo: null,
  photoAlt: '',
})

const errors = ref<FieldError[]>([])
const serverError = ref('')
const publishing = ref(false)
const summary = ref<HTMLElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)

const errorFor = (field: Field) => errors.value.find((e) => e.field === field)?.message
const hasErrors = computed(() => errors.value.length > 0 || serverError.value !== '')

/** aria-describedby : aide éventuelle + message d'erreur du champ */
function describedBy(field: Field, hint?: string) {
  return [hint, errorFor(field) ? `${field}-error` : undefined].filter(Boolean).join(' ') || undefined
}

function onPhotoChange(event: Event) {
  form.photo = (event.target as HTMLInputElement).files?.[0] ?? null
}

function removePhoto() {
  form.photo = null
  form.photoAlt = ''
  if (photoInput.value) photoInput.value.value = ''
}

async function showErrors() {
  await nextTick()
  // Récapitulatif des erreurs en haut du formulaire, qui reçoit le focus (WCAG 3.3.1).
  summary.value?.focus()
}

async function submit() {
  serverError.value = ''
  errors.value = validatePost(form)
  if (errors.value.length) return showErrors()

  publishing.value = true
  try {
    const post = await communityService.publish(form)
    await router.push({ name: 'community-article', params: { id: post.id }, query: { published: '1' } })
  } catch (error) {
    if (error instanceof ApiError && error.violations.length) {
      errors.value = error.violations.map((v) => ({ field: v.propertyPath as Field, message: v.message }))
    } else {
      serverError.value =
        error instanceof ApiError && error.status !== 0
          ? error.message
          : 'Publication could not be confirmed. Your text is still below; please try again.'
    }
    await showErrors()
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <RouterLink class="back" :to="{ name: 'community' }">Community journal</RouterLink>
  <h1>Write an article</h1>
  <p>
    Share what you saw on your visit. Once published, your article will be visible to everyone who visits this site.
  </p>

  <div v-if="hasErrors" ref="summary" class="error-summary" role="alert" tabindex="-1">
    <h2>There is a problem</h2>
    <p v-if="serverError">{{ serverError }}</p>
    <ul v-if="errors.length">
      <li v-for="e in errors" :key="e.field">
        <a :href="`#${e.field}`">{{ e.message }}</a>
      </li>
    </ul>
  </div>

  <form class="community-form" novalidate @submit.prevent="submit">
    <label for="title">Article title</label>
    <p v-if="errorFor('title')" id="title-error" class="field-error">{{ errorFor('title') }}</p>
    <input
      id="title"
      v-model="form.title"
      name="title"
      :maxlength="LIMITS.title"
      required
      :aria-invalid="!!errorFor('title')"
      :aria-describedby="describedBy('title')"
    />

    <label for="category">Category</label>
    <p v-if="errorFor('category')" id="category-error" class="field-error">{{ errorFor('category') }}</p>
    <select
      id="category"
      v-model="form.category"
      name="category"
      required
      :aria-invalid="!!errorFor('category')"
      :aria-describedby="describedBy('category')"
    >
      <option value="">Choose a category</option>
      <option v-for="c in COMMUNITY_CATEGORIES" :key="c" :value="c">{{ c }}</option>
    </select>

    <label for="authorName">Display name (optional)</label>
    <p v-if="errorFor('authorName')" id="authorName-error" class="field-error">{{ errorFor('authorName') }}</p>
    <input
      id="authorName"
      v-model="form.authorName"
      name="authorName"
      autocomplete="nickname"
      :maxlength="LIMITS.authorName"
      :aria-invalid="!!errorFor('authorName')"
      :aria-describedby="describedBy('authorName', 'authorName-hint')"
    />
    <p id="authorName-hint" class="field-hint">Leave empty to appear as “A visitor”. Do not use your full name.</p>

    <label for="place">Place visited (optional)</label>
    <p v-if="errorFor('place')" id="place-error" class="field-error">{{ errorFor('place') }}</p>
    <input
      id="place"
      v-model="form.place"
      name="place"
      :maxlength="LIMITS.place"
      :aria-invalid="!!errorFor('place')"
      :aria-describedby="describedBy('place')"
    />

    <label for="body">Your field note</label>
    <p v-if="errorFor('body')" id="body-error" class="field-error">{{ errorFor('body') }}</p>
    <textarea
      id="body"
      v-model="form.body"
      name="body"
      :maxlength="LIMITS.body"
      required
      :aria-invalid="!!errorFor('body')"
      :aria-describedby="describedBy('body')"
    ></textarea>

    <label for="photo">Add a photo (optional)</label>
    <p id="photo-hint" class="field-hint">JPEG, PNG or WebP, up to 5 MB. Choose a photo you took and can share.</p>
    <p v-if="errorFor('photo')" id="photo-error" class="field-error">{{ errorFor('photo') }}</p>
    <input
      id="photo"
      ref="photoInput"
      type="file"
      name="photo"
      accept="image/jpeg,image/png,image/webp"
      :aria-invalid="!!errorFor('photo')"
      :aria-describedby="describedBy('photo', 'photo-hint')"
      @change="onPhotoChange"
    />
    <button v-if="form.photo" type="button" @click="removePhoto">Remove photo</button>

    <template v-if="form.photo">
      <label for="photoAlt">Describe the photo</label>
      <p id="photoAlt-hint" class="field-hint">
        Say what the photo shows for people who cannot see it, for example “A heron standing in the reeds”.
      </p>
      <p v-if="errorFor('photoAlt')" id="photoAlt-error" class="field-error">{{ errorFor('photoAlt') }}</p>
      <input
        id="photoAlt"
        v-model="form.photoAlt"
        name="photoAlt"
        :maxlength="LIMITS.photoAlt"
        required
        :aria-invalid="!!errorFor('photoAlt')"
        :aria-describedby="describedBy('photoAlt', 'photoAlt-hint')"
      />
    </template>

    <button class="primary" type="submit" :disabled="publishing" :aria-disabled="publishing">
      {{ publishing ? 'Publishing…' : 'Publish article' }}
    </button>
  </form>
</template>
