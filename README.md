# AI App Builder - MVP

## What Works Now

- **Prompt → Generate → Preview** complete workflow
- **Server-side AI**: API keys never reach the browser
- **Demo Mode**: Works without any API key (DEMO_MODE=true)
- **OpenAI-Compatible Provider**: Works with any OpenAI-compatible API
- **Live Preview**: Generated apps rendered in a sandboxed iframe
- **File Viewer**: View generated HTML, CSS, and JavaScript
- **Project Persistence**: Projects saved in browser localStorage, survives reload
- **Re-generation**: Generate a new version with a different prompt
- **Path Security**: Strict validation prevents directory traversal and unsafe paths
- **Schema Validation**: All AI output validated with Zod before use
- **Error Handling**: Clear user-facing error messages, technical details logged server-side

## Architecture

```
Browser (React + Vite)
    ↓ POST /api/generate
Express Server (Node.js)
    ↓
GenerateProjectService
    ↓
AIProvider (DemoProvider or OpenAICompatibleProvider)
    ↓
Validated ProjectGeneration (Zod)
    ↓
Browser receives project → displays files → renders preview
```

## How to Run

### Development

```bash
# Terminal 1: Start the API server
npx tsx server/index.ts

# Terminal 2: Start the frontend
npm run dev
```

The frontend (port 3000) proxies `/api` requests to the server (port 3001).

### Production

```bash
# Build frontend
npm run build

# Start server (serves both API and static files)
npx tsx server/index.ts
```

### Demo Mode (default)

The app works out of the box in Demo Mode. No API key needed.
Set `DEMO_MODE=true` in `.env` (this is the default).

### Real AI Provider

Create a `.env` file:

```
DEMO_MODE=false
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
PORT=3001
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `DEMO_MODE` | Server | Use DemoProvider when `true` |
| `AI_BASE_URL` | Server | OpenAI-compatible API base URL |
| `AI_API_KEY` | Server | API authentication key (NEVER exposed to browser) |
| `AI_MODEL` | Server | Model name to use |
| `PORT` | Server | Server port (default: 3001) |

## Security

- AI API keys exist ONLY on the server
- The browser never receives `AI_API_KEY`
- All AI output validated with Zod before use
- Path security prevents directory traversal
- Generated code runs in sandboxed iframe (`sandbox="allow-scripts"`)
- No `allow-same-origin` on preview iframe
- User input length-limited (10-5000 chars)
- File content length-limited (max 500KB per file)
- Error responses never expose stack traces or internal details

## Current Limitations

- **Single project type**: Static HTML/CSS/JS only
- **No authentication**: Anyone can use the app
- **Browser storage only**: Projects don't persist across devices
- **No version history**: Each generation replaces the previous
- **Single AI call**: No retry/repair loop beyond one attempt
- **No deployment**: Generated apps can only be previewed, not deployed
- **Unused dependencies**: Some template packages remain in package.json (cleanup pending)

## What Will Be Added Later

### Phase 2
- Authentication (user accounts)
- Database persistence
- Server-side project storage
- Multiple AI providers
- Project history/list

### Phase 3
- AI agent loop (understand → plan → code → review)
- File patching (modify existing files)
- Code modification through conversation

### Phase 4
- Secure sandbox execution
- Application builds (React, Next.js)
- Real framework templates

### Phase 5
- Collaboration
- Billing / credits
- Deployment / publishing
