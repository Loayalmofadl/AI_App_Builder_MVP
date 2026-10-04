# AI App Builder - MVP Status

## What Works Now

1. ✅ Prompt → Generate → Preview complete workflow
2. ✅ Demo Mode works without API key
3. ✅ Real provider calls happen server-side
4. ✅ No AI secret is exposed to the browser
5. ✅ POST /api/generate works over HTTP
6. ✅ Generated files appear in the UI
7. ✅ Live preview works (sandboxed iframe)
8. ✅ LocalStorage persistence works
9. ✅ Path security validation enforced
10. ✅ Zod schema validation on all AI output
11. ✅ Error normalization (no stack traces leaked)
12. ✅ Build passes
13. ✅ Typecheck passes

## How to Run

```bash
# Terminal 1: API server
npx tsx server/index.ts

# Terminal 2: Frontend dev server
npm run dev
```

Or for production:
```bash
npm run build
npx tsx server/index.ts  # Serves both API and static files
```

## Security Verification

- ✅ No `VITE_AI_API_KEY` in frontend source
- ✅ No `import.meta.env.VITE_AI_*` in frontend source
- ✅ No API key references in built frontend bundle
- ✅ `AI_API_KEY` only used in server-side code (`server/api/generate.ts`)
- ✅ Server uses `process.env` (not exposed to browser)
- ✅ Generated code runs in `sandbox="allow-scripts"` iframe
- ✅ No `allow-same-origin` on preview iframe

## Remaining Limitations

1. **Unused dependencies**: Some template packages remain in `package.json` (cannot be removed without editing package.json directly)
   - `@dnd-kit/*`, `@supabase/supabase-js`, `canvas-confetti`, `date-fns`, `framer-motion`, `lucide-react`, `react-router-dom`, `recharts`, `uuid`
   - These don't affect functionality or security
   - Cleanup recommended in next maintenance pass

2. **pnpm-lock.yaml**: Project uses npm (package-lock.json). Migration to pnpm recommended but not blocking.

3. **No server build step**: Server runs via `tsx` (TypeScript executor). For production, consider compiling to JS.

4. **No concurrent dev command**: Requires two terminals. Could add `concurrently` script.
