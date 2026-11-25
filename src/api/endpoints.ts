import { api } from './client'
import type { Article, ArticleInput, Category, Collection, User } from './types'

// Authentification : voir src/features/auth/useAuth.ts

export const articles = {
  list: (query?: { page?: number; category?: string }) => api.get<Collection<Article>>('/articles', { query }),
  get: (id: number) => api.get<Article>(`/articles/${id}`),
  create: (input: ArticleInput) => api.post<Article>('/articles', input),
  update: (id: number, patch: Partial<ArticleInput>) => api.patch<Article>(`/articles/${id}`, patch),
  remove: (id: number) => api.delete(`/articles/${id}`),
}

export const categories = {
  list: () => api.get<Collection<Category>>('/categories'),
  get: (id: number) => api.get<Category>(`/categories/${id}`),
}

export const users = {
  get: (id: number) => api.get<User>(`/users/${id}`),
}
