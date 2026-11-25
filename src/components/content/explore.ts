import type { RouteLocationRaw } from 'vue-router'

/** Un lien de la liste « Explore … » (composant ExploreCover) */
export interface ExploreItem {
  key: string
  title: string
  to: RouteLocationRaw
  /** Ligne secondaire facultative (ex. « Example: A robin ») */
  detail?: string
  /** Vignette facultative, décorative (le titre suffit à identifier le lien) */
  image?: string
}
