/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Only non-secret configuration may be exposed to the frontend
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
