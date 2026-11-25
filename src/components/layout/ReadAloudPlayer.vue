<script setup lang="ts">
/**
 * Barre de lecture à voix haute, affichée en bas de l'écran pendant la lecture.
 * Ouverte par le bouton « Listen » de l'en-tête. Le focus y est placé pour la piloter au clavier.
 */
import { nextTick, ref, watch } from 'vue'
import { RATES } from '@/features/accessibility/readAloud'
import { useReadAloud } from '@/features/accessibility/useReadAloud'

const { state, rate, position, pause, resume, stop, previous, next, setRate } = useReadAloud()
const playButton = ref<HTMLButtonElement | null>(null)

// Place laissée en bas de page pour que la barre ne cache jamais le contenu ni l'élément qui a le focus.
watch(state, async (s, before) => {
  document.documentElement.classList.toggle('read-aloud-open', s !== 'idle')
  if (before === 'idle' && s !== 'idle') {
    await nextTick()
    playButton.value?.focus()
  }
})

function close() {
  stop()
  document.getElementById('listen-button')?.focus()
}
</script>

<template>
  <section v-if="state !== 'idle'" class="read-aloud read-aloud-skip" aria-labelledby="read-aloud-title">
    <h2 id="read-aloud-title" class="read-aloud-title">
      Reading this page aloud <span class="read-aloud-position">{{ position }}</span>
    </h2>
    <div class="read-aloud-controls">
      <button type="button" @click="previous">
        <span aria-hidden="true">⏮</span> Previous<span class="sr-only"> paragraph</span>
      </button>
      <button v-if="state === 'playing'" ref="playButton" type="button" class="primary" @click="pause">
        <span aria-hidden="true">⏸</span> Pause
      </button>
      <button v-else ref="playButton" type="button" class="primary" @click="resume">
        <span aria-hidden="true">▶</span> Resume
      </button>
      <button type="button" @click="next">
        Next<span class="sr-only"> paragraph</span> <span aria-hidden="true">⏭</span>
      </button>
      <label class="read-aloud-rate">
        Speed
        <select :value="rate" @change="setRate(Number(($event.target as HTMLSelectElement).value))">
          <option v-for="r in RATES" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </label>
      <button type="button" @click="close"><span aria-hidden="true">✕</span> Stop</button>
    </div>
  </section>
</template>
