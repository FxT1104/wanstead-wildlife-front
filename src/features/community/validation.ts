import { COMMUNITY_CATEGORIES, LIMITS, PHOTO_TYPES, type CommunityPostInput } from './types'

export type Field = 'title' | 'category' | 'authorName' | 'place' | 'body' | 'photo' | 'photoAlt'

export interface FieldError {
  field: Field
  message: string
}

/**
 * Validation côté navigateur (mêmes règles que le prototype).
 * Elle aide le visiteur mais ne remplace pas la validation du serveur.
 */
export function validatePost(input: CommunityPostInput): FieldError[] {
  const errors: FieldError[] = []
  const title = input.title.trim()
  const body = input.body.trim()

  if (!title) errors.push({ field: 'title', message: 'Enter a title for your article.' })
  else if (title.length > LIMITS.title)
    errors.push({ field: 'title', message: `Use ${LIMITS.title} characters or fewer for the title.` })

  if (!(COMMUNITY_CATEGORIES as readonly string[]).includes(input.category))
    errors.push({ field: 'category', message: 'Choose a category for your article.' })

  if (input.authorName.trim().length > LIMITS.authorName)
    errors.push({ field: 'authorName', message: `Use ${LIMITS.authorName} characters or fewer for your name.` })

  if (input.place.trim().length > LIMITS.place)
    errors.push({ field: 'place', message: `Use ${LIMITS.place} characters or fewer for the place.` })

  if (!body) errors.push({ field: 'body', message: 'Write your field note.' })
  else if (body.length > LIMITS.body)
    errors.push({ field: 'body', message: `Use ${LIMITS.body} characters or fewer for your field note.` })

  if (input.photo) {
    if (!(PHOTO_TYPES as readonly string[]).includes(input.photo.type))
      errors.push({ field: 'photo', message: 'Choose a JPEG, PNG or WebP image.' })
    else if (input.photo.size === 0 || input.photo.size > LIMITS.photoBytes)
      errors.push({ field: 'photo', message: 'Choose a photo of 5 MB or less.' })

    const alt = input.photoAlt.trim()
    if (!alt) errors.push({ field: 'photoAlt', message: 'Describe the photo for people who cannot see it.' })
    else if (alt.length > LIMITS.photoAlt)
      errors.push({ field: 'photoAlt', message: `Use ${LIMITS.photoAlt} characters or fewer for the description.` })
  }

  return errors
}

/** Lit les catégories valides dans la query string (?category=Birds&category=...). */
export function parseCategories(value: unknown): string[] {
  const list = Array.isArray(value) ? value : value == null ? [] : [value]
  return list.filter((c): c is string => (COMMUNITY_CATEGORIES as readonly string[]).includes(c as string))
}

/** Extrait de 160 caractères maximum, espaces normalisés. */
export function excerpt(body: string, max = 160): string {
  const text = body.trim().replace(/\s+/g, ' ')
  return text.length > max ? text.slice(0, max - 3).trimEnd() + '…' : text
}
