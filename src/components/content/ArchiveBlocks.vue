<script setup lang="ts">
/**
 * Affiche le contenu migré, mis en forme pour la lecture :
 * - sommaire « On this page » quand la page a au moins 3 intertitres ;
 * - premier paragraphe mis en avant ;
 * - photos consécutives regroupées en galerie, photo isolée placée à côté du texte ;
 * - tableaux longs filtrables (DataTable) ;
 * - paragraphes de plus de ~90 mots coupés aux fins de phrase (présentation seulement) ;
 * - colonne latérale (sommaire + contenu du slot « aside ») sur grand écran.
 * Tout est rendu en texte (jamais en HTML) : aucun risque d'injection depuis le site source.
 */
import { computed, useId, useSlots } from 'vue'
import { splitLongParagraph } from '@/features/reading/split'
import type { ArchivePage, Block } from '@/content/types'
import RunsText from './RunsText.vue'
import DataTable from './DataTable.vue'

const props = defineProps<{
  page: ArchivePage
  /** La première photo est déjà affichée en tête de page : ne pas la répéter */
  skipFirstImage?: boolean
}>()
const uid = useId()
const slots = useSlots()

type Image = Extract<Block, { type: 'image' }>
type Segment =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string; id: string }
  | { kind: 'lead'; block: Extract<Block, { type: 'paragraph' }> }
  | { kind: 'block'; block: Block }
  | { kind: 'gallery'; images: Image[] }
  | { kind: 'figure'; image: Image; side: boolean }
  | { kind: 'table'; block: Extract<Block, { type: 'table' }>; index: number }

const segments = computed<Segment[]>(() => {
  const out: Segment[] = []
  let leadDone = false
  let tableIndex = 0
  /** Mots de texte depuis la dernière photo flottante (pour ne jamais en avoir deux côte à côte) */
  let wordsSinceSide = Infinity
  const wordsOf = (b: Block | undefined) =>
    b?.type === 'paragraph' ? b.runs.map((r) => r.text).join('').split(/\s+/).filter(Boolean).length : 0
  const firstImage = props.page.blocks.findIndex((b) => b.type === 'image')
  const blocks = props.skipFirstImage ? props.page.blocks.filter((_, i) => i !== firstImage) : props.page.blocks
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!
    if (b.type === 'image') {
      const images: Image[] = [b]
      while (blocks[i + 1]?.type === 'image') images.push(blocks[++i] as Image)
      if (images.length > 1) out.push({ kind: 'gallery', images })
      else {
        // Photo seule à côté du texte seulement si assez de texte suit pour l'entourer
        // et si la photo flottante précédente est déjà loin ; sinon en pleine ligne.
        const side = wordsOf(blocks[i + 1]) >= 50 && wordsSinceSide >= 80
        if (side) wordsSinceSide = 0
        out.push({ kind: 'figure', image: b, side })
      }
    } else if (b.type === 'heading') {
      wordsSinceSide = Infinity // un intertitre passe sous les photos flottantes (clear)
      out.push({ kind: 'heading', level: b.level, text: b.text, id: `${uid}-h${i}` })
    } else if (b.type === 'paragraph' && !leadDone && !out.some((s) => s.kind === 'heading')) {
      wordsSinceSide += wordsOf(b)
      leadDone = true
      out.push({ kind: 'lead', block: b })
    } else if (b.type === 'table') {
      out.push({ kind: 'table', block: b, index: ++tableIndex })
    } else if (b.type === 'paragraph') {
      wordsSinceSide += wordsOf(b)
      for (const runs of splitLongParagraph(b.runs)) out.push({ kind: 'block', block: { type: 'paragraph', runs } })
    } else {
      out.push({ kind: 'block', block: b })
    }
  }
  return out
})

/** Sommaire : intertitres de premier niveau présents (h2, sinon h3) */
const toc = computed(() => {
  const headings = segments.value.filter((s): s is Extract<Segment, { kind: 'heading' }> => s.kind === 'heading')
  const top = Math.min(...headings.map((h) => h.level))
  const entries = headings.filter((h) => h.level === top)
  return entries.length >= 3 ? entries : []
})

/**
 * Photo introuvable sur l'ancien site : on retire son cadre (figure ou case de galerie)
 * plutôt que d'afficher une icône d'image brisée.
 */
function hideBroken(event: Event) {
  const img = event.target as HTMLImageElement
  ;(img.closest('li') ?? img.closest('figure'))?.setAttribute('hidden', '')
}

const hasAside = computed(() => toc.value.length > 0 || !!slots.aside)

const tableLabel = (index: number) =>
  props.page.blocks.filter((b) => b.type === 'table').length > 1 ? `${props.page.title}, table ${index}` : props.page.title
</script>

<template>
  <!-- archive-wrap = conteneur de référence (container queries) ; archive-layout = la grille -->
  <div class="archive-wrap">
    <div class="archive-layout" :class="{ 'has-aside': hasAside }">
    <div v-if="hasAside" class="archive-aside">
      <nav v-if="toc.length" class="archive-toc" :aria-labelledby="`${uid}-toc`">
        <h2 :id="`${uid}-toc`">On this page</h2>
        <ol>
          <li v-for="h in toc" :key="h.id">
            <a :href="`#${h.id}`">{{ h.text }}</a>
          </li>
        </ol>
      </nav>
      <slot name="aside" />
    </div>

    <div class="archive-blocks">
      <template v-for="(s, i) in segments" :key="i">
        <h2 v-if="s.kind === 'heading' && s.level === 2" :id="s.id" tabindex="-1">{{ s.text }}</h2>
        <h3 v-else-if="s.kind === 'heading' && s.level === 3" :id="s.id" tabindex="-1">{{ s.text }}</h3>
        <h4 v-else-if="s.kind === 'heading'" :id="s.id" tabindex="-1">{{ s.text }}</h4>

        <p v-else-if="s.kind === 'lead'" class="archive-lead"><RunsText :runs="s.block.runs" /></p>

        <figure v-else-if="s.kind === 'figure'" class="archive-figure" :class="{ 'is-side': s.side }">
          <img :src="s.image.src" :alt="s.image.alt" loading="lazy" decoding="async" @error="hideBroken" />
          <figcaption v-if="s.image.caption">{{ s.image.caption }}</figcaption>
        </figure>

        <ul v-else-if="s.kind === 'gallery'" class="archive-gallery" :aria-label="`${s.images.length} photographs`">
          <li v-for="(img, j) in s.images" :key="j">
            <figure>
              <img :src="img.src" :alt="img.alt" loading="lazy" decoding="async" @error="hideBroken" />
              <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
            </figure>
          </li>
        </ul>

        <DataTable
          v-else-if="s.kind === 'table'"
          :header="s.block.header"
          :rows="s.block.rows"
          :label="tableLabel(s.index)"
        />

        <template v-else-if="s.kind === 'block'">
          <p v-if="s.block.type === 'paragraph'"><RunsText :runs="s.block.runs" /></p>
          <component :is="s.block.ordered ? 'ol' : 'ul'" v-else-if="s.block.type === 'list'" class="archive-list">
            <li v-for="(item, j) in s.block.items" :key="j"><RunsText :runs="item" /></li>
          </component>
        </template>
      </template>

    </div>
    </div>
  </div>
</template>
