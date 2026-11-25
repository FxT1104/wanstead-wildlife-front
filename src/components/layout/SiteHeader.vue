<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuth } from '@/features/auth/useAuth'
import { useReadAloud } from '@/features/accessibility/useReadAloud'

const emit = defineEmits<{ openAccessibility: [] }>()

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/wildlife', label: 'Wildlife' },
  { to: '/places', label: 'Places' },
  { to: '/news', label: 'News' },
  { to: '/about', label: 'About' },
  { to: '/community', label: 'Community' },
]

const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const route = useRoute()
const { isAuthenticated, isAdmin } = useAuth()
const reader = useReadAloud()
const listening = () => reader.state.value !== 'idle'

// Le CSS du prototype s'appuie sur body.menu-open.
watch(menuOpen, (open) => document.body.classList.toggle('menu-open', open))
// Fermer le menu mobile après navigation.
watch(() => route.fullPath, () => (menuOpen.value = false))

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
    menuButton.value?.focus()
  }
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="site-header edition-header">
    <RouterLink class="brand" to="/" aria-label="Wanstead Wildlife home">
      <svg viewBox="0 0 60 80" aria-hidden="true">
        <path d="M12 56Q15 29 33 27Q23 14 34 9Q41 5 50 14L39 13Q32 15 39 24Q47 35 34 45L22 57Z" fill="currentColor" />
        <path d="M24 52L20 74M30 49L34 73M42 13L59 17L43 17" stroke="currentColor" fill="none" stroke-width="2" />
      </svg>
      <span class="wordmark">wanstead<span>wildlife</span><small>NATURE · WILDLIFE · DISCOVERY</small></span>
    </RouterLink>

    <button
      ref="menuButton"
      class="menu-toggle"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="site-nav"
      @click="menuOpen = !menuOpen"
    >
      Menu
    </button>

    <!-- RouterLink pose automatiquement aria-current="page" sur le lien actif (exact). -->
    <nav id="site-nav" aria-label="Main navigation">
      <RouterLink v-for="item in navigation" :key="item.to" :to="item.to">{{ item.label }}</RouterLink>
    </nav>

    <div class="header-tools">
      <RouterLink to="/search" class="tool-link">Search</RouterLink>
      <RouterLink v-if="isAdmin" to="/admin" class="tool-link">Admin</RouterLink>
      <RouterLink v-if="isAuthenticated" to="/account" class="tool-link">My account</RouterLink>
      <RouterLink v-else :to="{ name: 'login' }" class="tool-link">Sign in</RouterLink>
      <!-- Lecture à voix haute (synthèse vocale du navigateur) ; absent si le navigateur ne la propose pas -->
      <button
        v-if="reader.supported"
        id="listen-button"
        type="button"
        class="listen-button"
        :aria-pressed="listening()"
        @click="listening() ? reader.stop() : reader.start()"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
          <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
          <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Listen
      </button>
      <button type="button" aria-haspopup="dialog" @click="emit('openAccessibility')">Accessibility</button>
    </div>
  </header>
</template>
