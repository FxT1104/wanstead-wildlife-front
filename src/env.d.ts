/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_COMMUNITY_BACKEND?: 'local' | 'api'
  readonly VITE_SUPPORT_BACKEND?: 'local' | 'api'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
