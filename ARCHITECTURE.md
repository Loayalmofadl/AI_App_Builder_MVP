# Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (Vite + React)                     │
│  App.tsx, Header, PromptPanel, FilePanel, PreviewPanel       │
│  api-client.ts → POST /api/generate                          │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼─────────────────────────────────────┐
│                 Express Server (Node.js)                      │
│  POST /api/generate → validate → GenerateProjectService      │
│  GET /api/health                                             │
│  Serves static dist/ in production                           │
├──────────────────────────────────────────────────────────────┤
│                    Service Layer                              │
│              GenerateProjectService                           │
├──────────┬───────────┬───────────┬───────────────────────────┤
│ Provider │ Validation│  Preview  │       Storage             │
│  (AI)    │   (Zod)   │ Composer  │   (ProjectStore)          │
├──────────┴───────────┴───────────┴───────────────────────────┤
│                    Core Contracts                             │
│             Types, Schemas, Errors                            │
└──────────────────────────────────────────────────────────────┘
```

## Module Boundaries

### Frontend (`src/`)
- **App.tsx** - Main application component
- **components/** - UI components (Header, PromptPanel, FilePanel, PreviewPanel)
- **services/api-client.ts** - HTTP client for server API
- **core/contracts/** - Shared types and schemas (also used by server)
- **storage/** - Browser localStorage persistence
- **preview/** - Iframe preview composer
- **validation/** - Path security validation
- **providers/ai/** - AI provider interface + implementations (used by server only)

### Server (`server/`)
- **index.ts** - Express server entry point
- **api/generate.ts** - POST /api/generate handler
- **api/health.ts** - GET /api/health handler

### Shared Code (imported by server from `src/`)
- `src/core/contracts/types.ts` - Domain types
- `src/core/contracts/schemas.ts` - Zod validation schemas
- `src/providers/ai/provider.ts` - AIProvider interface
- `src/providers/ai/demo.ts` - DemoProvider
- `src/providers/ai/openai-compatible.ts` - OpenAICompatibleProvider
- `src/services/generate-project.ts` - Generation orchestration
- `src/validation/paths.ts` - Path security

## Data Flow

1. User enters prompt in browser
2. Frontend calls `POST /api/generate` with `{ prompt }`
3. Server validates request with Zod
4. Server creates appropriate provider (DemoProvider or OpenAICompatibleProvider)
5. Server calls `GenerateProjectService.generate(prompt)`
6. Service calls provider, validates output with Zod
7. Service validates file paths for security
8. Server returns validated `Project` to browser
9. Frontend displays files and renders preview in sandboxed iframe
10. Frontend saves project to localStorage

## Security Boundaries

- **AI API keys**: Server-side only (`process.env.AI_API_KEY`)
- **Frontend**: Never receives secrets, only validated project data
- **Generated code**: Runs in sandboxed iframe (`sandbox="allow-scripts"`)
- **File paths**: Validated against allowlist (index.html, styles.css, app.js)
- **Input**: Length-limited, validated with Zod
- **Errors**: Normalized, no stack traces or internal details exposed

## Extension Points

### Adding a new AI provider
1. Create `src/providers/ai/new-provider.ts` implementing `AIProvider`
2. Add to factory in `server/api/generate.ts`
3. No frontend changes needed

### Adding a new project type
1. Extend `FileLanguage` type in contracts
2. Update `ALLOWED_PATHS` in schemas
3. Update preview composer for new file types

### Replacing localStorage with a database
1. Implement `ProjectStore` interface with database calls
2. Swap implementation in frontend
3. No API changes needed

### Adding authentication
1. Add auth middleware to Express server
2. Gate the `/api/generate` endpoint
3. Associate projects with users in storage
