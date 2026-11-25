import type { CommunityPost } from './types'

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  })
}

/** « Birds · A visitor · Bush Wood · 2 November 2026 » */
export function postMeta(post: CommunityPost): string {
  return [post.category, post.authorName || 'A visitor', post.place, formatDate(post.publishedAt)]
    .filter(Boolean)
    .join(' · ')
}
