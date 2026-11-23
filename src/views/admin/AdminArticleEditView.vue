<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ErrorSummary from '@/components/forms/ErrorSummary.vue'
import { articles, categories } from '@/api/endpoints'
import type { ArticleInput, Category } from '@/api/types'
import { describedBy, errorFor, fromApiError, type SummaryError } from '@/features/forms/errors'
import { slugify } from '@/lib/slug'

/** id absent = nouvel article */
const props = defineProps<{ id?: string }>()
const router = useRouter()

const isNew = computed(() => !props.id)
const form = reactive({ title: '', slug: '', category: '', summary: '', content: '', published: false })
/** Date de publication d'origine : conservée si l'article reste publié */
const originalPublishedAt = ref<string | null>(null)
const slugTouched = ref(false)
const cats = ref<Category[]>([])
const state = ref<'loading' | 'ready' | 'error'>('loading')
const errors = ref<SummaryError[]>([])
const message = ref('')
const busy = ref(false)
const saved = ref('')
const summary = ref<InstanceType<typeof ErrorSummary> | null>(null)

// Le slug suit le titre tant que l'administrateur ne l'a pas modifié lui-même.
watch(
  () => form.title,
  (title) => {
    if (!slugTouched.value) form.slug = slugify(title)
  },
)

onMounted(async () => {
  try {
    cats.value = (await categories.list()).member
    if (props.id) {
      const a = await articles.get(Number(props.id))
      Object.assign(form, {
        title: a.title,
        slug: a.slug,
        category: a.category,
        summary: a.summary ?? '',
        content: a.content,
        published: a.publishedAt !== null,
      })
      originalPublishedAt.value = a.publishedAt
      slugTouched.value = true
    }
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
})

function validate(): SummaryError[] {
  const e: SummaryError[] = []
  if (!form.title.trim()) e.push({ field: 'title', message: 'Enter a title.' })
  if (!/^[a-z0-9-]+$/.test(form.slug))
    e.push({ field: 'slug', message: 'Use only lowercase letters, numbers and hyphens in the web address.' })
  if (!form.category) e.push({ field: 'category', message: 'Choose a category.' })
  if (form.summary.length > 500) e.push({ field: 'summary', message: 'Use 500 characters or fewer for the summary.' })
  if (!form.content.trim()) e.push({ field: 'content', message: 'Write the article text.' })
  return e
}

async function save() {
  message.value = ''
  saved.value = ''
  errors.value = validate()
  if (errors.value.length) return summary.value?.focus()

  const input: ArticleInput = {
    title: form.title.trim(),
    slug: form.slug,
    category: form.category,
    summary: form.summary.trim() || null,
    content: form.content,
    publishedAt: form.published ? (originalPublishedAt.value ?? new Date().toISOString()) : null,
  }

  busy.value = true
  try {
    if (props.id) {
      const a = await articles.update(Number(props.id), input)
      originalPublishedAt.value = a.publishedAt
      saved.value = form.published ? 'Changes saved. The article is published.' : 'Changes saved as a draft.'
    } else {
      const a = await articles.create(input)
      await router.replace({ name: 'admin-article-edit', params: { id: a.id }, query: { created: '1' } })
    }
  } catch (error) {
    ;({ errors: errors.value, message: message.value } = fromApiError(
      error,
      'The article could not be saved. Your text is still below; please try again.',
    ))
    summary.value?.focus()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <RouterLink class="back" :to="{ name: 'admin-articles' }">All articles</RouterLink>
  <h1>{{ isNew ? 'Write an article' : 'Edit article' }}</h1>

  <p v-if="state === 'loading'">Loading…</p>
  <p v-else-if="state === 'error'" role="alert">The article could not be loaded. Check that the API is running.</p>

  <template v-else>
    <p v-if="$route.query.created && !saved" role="status" class="success-message">The article has been created.</p>
    <p v-if="saved" role="status" class="success-message">{{ saved }}</p>
    <ErrorSummary ref="summary" :errors="errors" :message="message" />

    <form class="community-form" novalidate @submit.prevent="save">
      <label for="title">Title</label>
      <p v-if="errorFor(errors, 'title')" id="title-error" class="field-error">{{ errorFor(errors, 'title') }}</p>
      <input
        id="title"
        v-model="form.title"
        name="title"
        maxlength="255"
        required
        :aria-invalid="!!errorFor(errors, 'title')"
        :aria-describedby="describedBy(errors, 'title')"
      />

      <label for="slug">Web address</label>
      <p id="slug-hint" class="field-hint">Filled in from the title. Lowercase letters, numbers and hyphens only.</p>
      <p v-if="errorFor(errors, 'slug')" id="slug-error" class="field-error">{{ errorFor(errors, 'slug') }}</p>
      <input
        id="slug"
        v-model="form.slug"
        name="slug"
        maxlength="255"
        spellcheck="false"
        required
        :aria-invalid="!!errorFor(errors, 'slug')"
        :aria-describedby="describedBy(errors, 'slug', 'slug-hint')"
        @input="slugTouched = true"
      />

      <label for="category">Category</label>
      <p v-if="errorFor(errors, 'category')" id="category-error" class="field-error">
        {{ errorFor(errors, 'category') }}
      </p>
      <select
        id="category"
        v-model="form.category"
        name="category"
        required
        :aria-invalid="!!errorFor(errors, 'category')"
        :aria-describedby="describedBy(errors, 'category')"
      >
        <option value="">Choose a category</option>
        <option v-for="c in cats" :key="c['@id']" :value="c['@id']">{{ c.name }}</option>
      </select>

      <label for="summary">Summary (optional)</label>
      <p id="summary-hint" class="field-hint">One or two sentences shown in article lists.</p>
      <p v-if="errorFor(errors, 'summary')" id="summary-error" class="field-error">
        {{ errorFor(errors, 'summary') }}
      </p>
      <textarea
        id="summary"
        v-model="form.summary"
        name="summary"
        rows="3"
        maxlength="500"
        :aria-invalid="!!errorFor(errors, 'summary')"
        :aria-describedby="describedBy(errors, 'summary', 'summary-hint')"
      ></textarea>

      <label for="content">Article text</label>
      <p v-if="errorFor(errors, 'content')" id="content-error" class="field-error">
        {{ errorFor(errors, 'content') }}
      </p>
      <textarea
        id="content"
        v-model="form.content"
        name="content"
        required
        :aria-invalid="!!errorFor(errors, 'content')"
        :aria-describedby="describedBy(errors, 'content')"
      ></textarea>

      <label class="check-row" for="published">
        <input id="published" v-model="form.published" type="checkbox" name="published" />
        Published (visible to everyone)
      </label>

      <button class="primary" type="submit" :disabled="busy">
        {{ busy ? 'Saving…' : form.published ? 'Save and publish' : 'Save as draft' }}
      </button>
    </form>
  </template>
</template>
