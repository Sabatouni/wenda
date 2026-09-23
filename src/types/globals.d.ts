// Global type declarations for process.env
// Standalone declaration — does not depend on @types/node or NodeJS namespace.

interface ProcessEnv {
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  readonly NODE_ENV?: 'development' | 'production' | 'test'
  readonly [key: string]: string | undefined
}

// eslint-disable-next-line no-var
declare var process: {
  readonly env: ProcessEnv
}
