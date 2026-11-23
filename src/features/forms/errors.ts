import { ApiError } from '@/api/client'

export interface SummaryError {
  /** id du champ concerné (le lien du récapitulatif y amène le focus) */
  field: string
  message: string
}

/** Message d'erreur du champ, ou undefined */
export function errorFor(errors: SummaryError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message
}

/** Valeur de aria-describedby : aide éventuelle + message d'erreur du champ */
export function describedBy(errors: SummaryError[], field: string, hint?: string): string | undefined {
  return [hint, errorFor(errors, field) ? `${field}-error` : undefined].filter(Boolean).join(' ') || undefined
}

/**
 * Convertit une erreur d'API en erreurs par champ (violations 422) ou en message général.
 * `fieldMap` renomme les champs du serveur vers les id du formulaire (ex. plainPassword → password).
 */
export function fromApiError(
  error: unknown,
  fallback: string,
  fieldMap: Record<string, string> = {},
): { errors: SummaryError[]; message: string } {
  if (error instanceof ApiError) {
    if (error.violations.length) {
      return {
        errors: error.violations.map((v) => ({ field: fieldMap[v.propertyPath] ?? v.propertyPath, message: v.message })),
        message: '',
      }
    }
    if (error.status !== 0 && error.status < 500) return { errors: [], message: error.message }
  }
  return { errors: [], message: fallback }
}
