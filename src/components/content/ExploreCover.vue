<script setup lang="ts">
/**
 * Page d'entrée d'une rubrique (Wildlife, Places…) : grande illustration, titre,
 * bouton « Explore … » qui déplie une liste filtrable de liens.
 * Un seul composant pour toutes les rubriques : même rendu, même comportement clavier.
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { normalise } from '@/data/catalogue'
import type { ExploreItem } from './explore'

const props = defineProps<{
  /** Libellé de la rubrique dans le fil d'Ariane */
  section: string
  /** Titre en deux temps : « The living » + « landscape. » (en italique) */
  title: string
  titleEmphasis: string
  /** Illustration de fond (décorative) */
  art: string
  /** Texte du bouton, ex. « Explore wildlife » */
  exploreLabel: string
  /** Libellé du champ de filtre, ex. « Find a wildlife group » */
  searchLabel: string
  searchPlaceholder: string
  /** Nom des éléments pour le compteur : [singulier, pluriel] */
  noun: [string, string]
  items: ExploreItem[]
}>()

const query = ref('')
const finder = ref<HTMLDetailsElement | null>(null)
const summary = ref<HTMLElement | null>(null)

const results = computed(() => {
  const terms = normalise(query.value).split(/\s+/).filter(Boolean)
  return props.items.filter((item) => {
    const haystack = normalise(`${item.title} ${item.detail ?? ''}`)
    return terms.every((t) => haystack.includes(t))
  })
})

const countLabel = computed(() => {
  const n = results.value.length
  return n ? `${n} ${n === 1 ? props.noun[0] : props.noun[1]}` : `No ${props.noun[1]} found. Try another name.`
})

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && finder.value?.open) {
    event.preventDefault()
    finder.value.open = false
    summary.value?.focus()
  }
}
</script>

<template>
  <div class="book-cover">
    <div class="book-art" aria-hidden="true" :style="{ backgroundImage: `url('${art}')` }"></div>
    <div class="book-copy">
      <nav class="book-path" aria-label="Breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{{ section }}</span>
      </nav>
      <h1>{{ title }}<br /><em>{{ titleEmphasis }}</em></h1>

      <!-- <details>/<summary> est nativement interactif ; Échap ne fait qu'ajouter un raccourci de fermeture. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <details ref="finder" class="book-finder" @keydown="closeOnEscape">
        <summary ref="summary">{{ exploreLabel }}<span aria-hidden="true"></span></summary>
        <div class="book-picker">
          <label for="book-query">{{ searchLabel }}</label>
          <input id="book-query" v-model="query" type="search" :placeholder="searchPlaceholder" autocomplete="off" />
          <p class="book-count" role="status" aria-live="polite">{{ countLabel }}</p>
          <ul>
            <li v-for="item in results" :key="item.key" :class="{ 'no-thumb': !item.image }">
              <RouterLink :to="item.to">
                <img
                  v-if="item.image"
                  :src="item.image"
                  width="88"
                  height="88"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span class="group-text">
                  <strong>{{ item.title }}</strong>
                  <small v-if="item.detail">{{ item.detail }}</small>
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>
