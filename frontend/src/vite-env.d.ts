/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_TWITTER_BEARER_TOKEN: string
  readonly VITE_KIMI_API_KEY: string
  readonly VITE_USE_REAL_API: string
  readonly VITE_DEBUG_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
