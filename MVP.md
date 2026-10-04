# AI App Builder - MVP

## What Works Now

- **Prompt → Generate → Preview** complete workflow
- **Demo Mode**: Works without any API key, returns a realistic burger restaurant website
- **OpenAI-Compatible Provider**: Works with any OpenAI-compatible API (OpenAI, Together, Groq, etc.)
- **Live Preview**: Generated apps rendered in a sandboxed iframe
- **File Viewer**: View generated HTML, CSS, and JavaScript
- **Project Persistence**: Projects saved in browser localStorage, survives reload
- **Re-generation**: Generate a new version with a different prompt
- **Path Security**: Strict validation prevents directory traversal and unsafe paths
- **Schema Validation**: All AI output validated with Zod before use
- **Error Handling**: Clear user-facing error messages, technical details logged server-side

## How to Run

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

### Demo Mode (default)

The app works out of the box in Demo Mode. No API key needed.

### Real AI Provider

Create a `.env` file:

```
VITE_DEMO_MODE=false
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_API_KEY=your-api-key-here
VITE_AI_MODEL=gpt-4o-mini
```

## Current Limitations

- **Single project type**: Static HTML/CSS/JS only
- **No authentication**: Anyone can use the app
- **Browser storage only**: Projects don't persist across devices
- **No version history**: Each generation replaces the previous
- **Single AI call**: No retry/repair loop beyond one attempt
- **No deployment**: Generated apps can only be previewed, not deployed

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
- Validation/review agent

### Phase 4
- Secure sandbox execution
- Application builds (React, Next.js)
- Package installation
- Real framework templates
- Live development environments

### Phase 5
- Collaboration
- Billing / credits
- Deployment
- Publishing
