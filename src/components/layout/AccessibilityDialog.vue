<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePreferences } from '@/features/accessibility/usePreferences'
import type { Contrast, Palette, TextScale } from '@/features/accessibility/preferences'

const { preferences, status, update, reset } = usePreferences()
const dialog = ref<HTMLDialogElement | null>(null)

const scales: { value: TextScale; label: string }[] = [
  { value: 100, label: 'Standard' },
  { value: 115, label: 'Large' },
  { value: 130, label: 'Larger' },
]

// <dialog> natif + showModal() : piège du focus, touche Échap et retour du focus gérés par le navigateur.
function open() {
  dialog.value?.showModal()
}
function close() {
  dialog.value?.close()
}

defineExpose({ open, close })
</script>

<template>
  <dialog id="accessibility-dialog" ref="dialog" aria-labelledby="accessibility-title">
    <form id="accessibility-form" @submit.prevent>
      <div class="dialog-top">
        <div>
          <p class="eyebrow">MAKE YOURSELF COMFORTABLE</p>
          <h2 id="accessibility-title">Reading preferences</h2>
        </div>
        <button type="button" aria-label="Close reading preferences" @click="close">Close</button>
      </div>
      <p>These preferences are saved on this browser. You can also use your browser’s zoom.</p>

      <fieldset>
        <legend>Text size</legend>
        <div class="choice-row">
          <label v-for="s in scales" :key="s.value">
            <input
              type="radio"
              name="scale"
              :value="s.value"
              :checked="preferences.scale === s.value"
              @change="update({ scale: s.value })"
            />
            {{ s.label }}
          </label>
        </div>
      </fieldset>

      <div class="form-columns">
        <label>
          Contrast
          <select
            name="contrast"
            :value="preferences.contrast"
            @change="update({ contrast: ($event.target as HTMLSelectElement).value as Contrast })"
          >
            <option value="standard">Standard</option>
            <option value="high">High contrast</option>
          </select>
        </label>
        <label>
          Palette
          <select
            name="colours"
            :value="preferences.colours"
            @change="update({ colours: ($event.target as HTMLSelectElement).value as Palette })"
          >
            <option value="natural">Natural colours</option>
            <option value="neutral">Neutral colours</option>
          </select>
        </label>
      </div>

      <label class="check-row">
        <input
          type="checkbox"
          name="spacing"
          :checked="preferences.spacing"
          @change="update({ spacing: ($event.target as HTMLInputElement).checked })"
        />
        More space between lines
      </label>
      <label class="check-row">
        <input
          type="checkbox"
          name="font"
          :checked="preferences.font"
          @change="update({ font: ($event.target as HTMLInputElement).checked })"
        />
        Use a simple font for headings
      </label>
      <label class="check-row">
        <input
          type="checkbox"
          name="motion"
          :checked="preferences.motion"
          @change="update({ motion: ($event.target as HTMLInputElement).checked })"
        />
        Reduce motion
      </label>

      <p id="preferences-status" role="status">{{ status }}</p>

      <div class="form-actions">
        <button type="button" @click="reset">Reset preferences</button>
        <button class="primary" type="button" @click="close">Done</button>
      </div>
      <RouterLink class="underlined" to="/accessibility" @click="close">About accessibility on this site</RouterLink>
    </form>
  </dialog>
</template>
