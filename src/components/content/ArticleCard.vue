<script setup lang="ts">
/**
 * Carte d'aperçu d'un article : image, titre (lien), début du texte.
 * Toute la carte est cliquable (le lien du titre s'étend sur la carte), mais il n'y a qu'un seul lien :
 * le lecteur d'écran entend seulement le titre, et la tabulation ne s'arrête qu'une fois.
 */
import { computed, ref } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { coverFor } from '@/features/news/coverImage'

const props = defineProps<{
  title: string
  excerpt: string
  image: string | null
  to: RouteLocationRaw
  /** Niveau du titre selon la page (h2 dans une liste sous le h1) */
  headingLevel?: 2 | 3
}>()

// Photo introuvable sur l'ancien site : on bascule sur l'illustration du sujet.
const broken = ref(false)
const cover = computed(() => coverFor({ ...props, image: broken.value ? null : props.image }))
</script>

<template>
  <article class="article-card">
    <div class="article-card-media" :class="{ 'is-illustration': cover.illustration }">
      <!-- Décorative : le titre identifie l'article. -->
      <img :src="cover.src" alt="" loading="lazy" decoding="async" @error="broken = true" />
    </div>
    <div class="article-card-body">
      <component :is="headingLevel === 3 ? 'h3' : 'h2'" class="article-card-title">
        <RouterLink :to="to">{{ title }}</RouterLink>
      </component>
      <p v-if="excerpt" class="article-card-excerpt">{{ excerpt }}</p>
    </div>
  </article>
</template>
