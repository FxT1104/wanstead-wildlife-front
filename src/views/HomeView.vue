<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import CommunityInvite from '@/components/CommunityInvite.vue'

const router = useRouter()
const query = ref('')

const categories = [
  { slug: 'birds', label: 'Birds', cls: 'bird' },
  { slug: 'mammals', label: 'Mammals', cls: 'mammal' },
  { slug: 'insects', label: 'Insects', cls: 'insect' },
  { slug: 'plants', label: 'Plants', cls: 'plant' },
  { slug: 'fungi', label: 'Fungi', cls: 'fungi' },
]

function search() {
  router.push({ name: 'search', query: query.value.trim() ? { q: query.value.trim() } : {} })
}
</script>

<template>
  <section class="nature-hero">
    <div class="nature-copy">
      <p class="eyebrow">WANSTEAD · EAST LONDON</p>
      <h1>Wildlife is<br />closer than<br />you think.</h1>
      <form class="hero-search" role="search" @submit.prevent="search">
        <label for="home-search">Find a species or place</label>
        <div>
          <input id="home-search" v-model="query" name="q" type="search" placeholder="Try Birds or Wanstead Park" />
          <button type="submit">Search</button>
        </div>
      </form>
      <RouterLink class="nature-button" to="/wildlife">Explore nature</RouterLink>
    </div>
    <div class="wave" aria-hidden="true"></div>
  </section>

  <section class="photo-categories" aria-label="Explore wildlife">
    <RouterLink
      v-for="c in categories"
      :key="c.slug"
      :class="['photo-category', c.cls]"
      :to="{ name: 'wildlife-group', params: { group: c.slug } }"
    >
      <span>{{ c.label }}</span>
    </RouterLink>
  </section>

  <section class="nature-story">
    <div>
      <p class="eyebrow">WHERE FOREST MEETS THE CITY</p>
      <h2>Nature,<br />on your doorstep.</h2>
      <p>This is where Epping Forest meets east London.</p>
      <RouterLink class="text-link" to="/places">Explore wildlife sites</RouterLink>
    </div>
    <RouterLink class="story-landscape" to="/places">
      <span>Wildlife in and around Wanstead</span>
    </RouterLink>
  </section>

  <section class="nature-bottom">
    <p class="eyebrow">WANSTEAD WILDLIFE</p>
    <h2>A haven for wildlife.</h2>
    <div>
      <p>
        In the south of Epping Forest, areas such as Wanstead Park and Bush Wood, Wanstead Flats, Leyton Flats and
        Gilbert's Slade provide a variety of habitats which include ancient woodland, landscaped parkland, heath,
        grassland, lakes and ponds.
      </p>
      <RouterLink class="text-link" to="/about">About Wanstead Wildlife</RouterLink>
    </div>
  </section>

  <CommunityInvite />
</template>
