# Architecture

## Module Boundaries

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                          │
│  App.tsx, Header, PromptPanel, FilePanel, Preview   │
├─────────────────────────────────────────────────────┤
│                  Service Layer                       │
│            GenerateProjectService                    │
├──────────┬──────────┬───────────┬───────────────────┤
│ Provider │Validation│  Preview  │     Storage       │
│  (AI)    │  (Zod)   │ Composer  │  (ProjectStore)   │
├──────────┴──────────┴───────────┴───────────────────┤
│                 Core Contracts                       │
│         Types, Schemas, Errors                       │
└─────────────────────────────────────────────────────┘
```

## Modules

### Core Contracts (`src/core/contracts/`)
- `types.ts` - Domain types (Project, GeneratedFile, GenerationState, GenerationError)
- `schemas.ts` - Zod validation schemas for AI output

### Providers (`src/providers/ai/`)
- `provider.ts` - AIProvider interface
- `demo.ts` - DemoProvider (deterministic, no API needed)
- `openai-compatible.ts` - OpenAICompatibleProvider (works with any compatible API)
- `index.ts` - Provider factory

### Services (`src/services/`)
- `generate-project.ts` - Orchestrates: prompt → AI → validate → project

### Validation (`src/validation/`)
- `paths.ts` - Path security (reject traversal, absolute paths, null bytes)

### Preview (`src/preview/`)
- `compose-preview.ts` - Combines files into single HTML for iframe

### Storage (`src/storage/`)
- `project-store.ts` - ProjectStore interface
- `local-storage-project-store.ts` - localStorage implementation

### Components (`src/components/`)
- `builder/Header.tsx` - App header with demo mode indicator
- `builder/PromptPanel.tsx` - Prompt input + generate button + status
- `files/FilePanel.tsx` - File tabs + code viewer
- `preview/PreviewPanel.tsx` - Sandboxed iframe preview

## Extension Points

### Adding a new AI provider
1. Create `src/providers/ai/new-provider.ts` implementing `AIProvider`
2. Add to factory in `src/providers/ai/index.ts`
3. No other changes needed

### Adding a new project type (React, Next.js, etc.)
1. Extend `FileLanguage` type in contracts
2. Update `ALLOWED_PATHS` in schemas
3. Update preview composer for new file types
4. Update UI file viewer for new languages

### Replacing localStorage with a database
1. Implement `ProjectStore` interface with database calls
2. Swap `LocalStorageProjectStore` for `DatabaseProjectStore`
3. No UI changes needed

### Adding authentication
1. Add auth context/provider
2. Gate the generate endpoint
3. Associate projects with users in storage

## Security

- AI API keys never exposed to client (in production, use server proxy)
- All AI output validated with Zod before use
- Path security prevents directory traversal
- Generated code runs in sandboxed iframe (`sandbox="allow-scripts"`)
- No `allow-same-origin` on preview iframe
- User input length-limited (10-5000 chars)
- File content length-limited (max 500KB per file)
