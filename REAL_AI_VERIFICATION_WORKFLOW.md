# Real AI Verification Workflow

## Overview

This document describes the manual GitHub Actions workflow for verifying real OpenAI API integration without exposing secrets.

## Workflow File

**Location:** `.github/workflows/real-ai-verification.yml`

**Trigger:** `workflow_dispatch` (manual only)

**Purpose:** Verify that the application can successfully generate projects using the real OpenAI API with prompt-specific content.

## Security Model

### Secret Management

- **Secret Name:** `OPENAI_API_KEY` (GitHub repository secret)
- **Usage:** Only as environment variable `AI_API_KEY`
- **Never:**
  - Committed to source code
  - Printed in logs
  - Exposed in error messages
  - Included in frontend bundle

### Security Checks

The workflow includes multiple security verifications:

1. **Response Check:** Verifies the API key doesn't appear in the HTTP response
2. **Log Check:** Verifies the API key doesn't appear in server logs
3. **No Echo:** Never echoes the secret value
4. **GitHub Masking:** GitHub Actions automatically masks secrets in logs

## Workflow Steps

### 1. Setup & Build
- Checkout repository
- Setup Node.js 20
- Install dependencies (`npm ci`)
- Run typecheck (`npm run typecheck`)
- Build frontend (`npm run build`)

### 2. Start Server
```bash
Environment:
  DEMO_MODE: false
  AI_BASE_URL: https://api.openai.com/v1
  AI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  AI_MODEL: gpt-4o-mini (or user-specified)
  PORT: 3001
```

Server starts in background and waits up to 30 seconds for health check.

### 3. Health Verification
- `GET /api/health`
- Verifies HTTP 200
- Verifies `status: "healthy"`
- Verifies `mode: "production"` (not demo)

### 4. Real AI Generation Test
**Prompt:**
```
Build a modern premium coffee shop website called Black Bean Coffee. 
Use a dark elegant design, coffee menu with realistic prices, testimonials, 
about section, and contact section. The content must be specific to 
Black Bean Coffee and must not use demo burger content.
```

**Verifications:**
- HTTP status 200
- `success: true`
- Project exists
- Files array exists
- Expected files: `index.html`, `styles.css`, `app.js`
- HTML contains "Black Bean Coffee" (prompt-specific)
- HTML does NOT contain "Ember & Oak" (demo content)
- HTML does NOT contain "burger" (demo content)
- API key not in response
- API key not in server logs

### 5. Summary Report
Generates a detailed summary table:

```
REAL AI VERIFICATION

Provider: OpenAI
Mode: Real AI (DEMO_MODE=false)
Model: gpt-4o-mini

| Check | Status |
|-------|--------|
| HTTP 200 | ✅ PASS |
| Generated project | ✅ PASS |
| Project structure | ✅ PASS |
| Files array | ✅ PASS |
| Expected files | ✅ PASS |
| Prompt-specific generation | ✅ PASS |
| No demo content | ✅ PASS |
| API key not in response | ✅ PASS |
| API key not in logs | ✅ PASS |
```

### 6. Cleanup
- Stops server process
- Shows last 20 lines of server log for debugging

## Configuration

### Required GitHub Secret

**Name:** `OPENAI_API_KEY`  
**Value:** Your OpenAI API key (starts with `sk-`)

**How to add:**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `OPENAI_API_KEY`
4. Value: Your OpenAI API key
5. Click "Add secret"

### Optional Input

**Model Selection:**
- Default: `gpt-4o-mini`
- Can be overridden when triggering workflow manually
- Must be a valid OpenAI model name

## Usage

### Manual Trigger

1. Go to repository Actions tab
2. Select "Real AI Verification (Manual)" workflow
3. Click "Run workflow"
4. (Optional) Change model name
5. Click "Run workflow" button

### Expected Duration

- Setup & build: ~30 seconds
- Server startup: ~5-10 seconds
- AI generation: ~10-30 seconds (depends on OpenAI API)
- Total: ~1-2 minutes

## Cost Considerations

**Important:** This workflow makes a real API call to OpenAI.

**Estimated cost per run:**
- Model: `gpt-4o-mini`
- Input tokens: ~500 (system prompt + user prompt)
- Output tokens: ~3000-5000 (generated website)
- Cost: ~$0.01-0.02 per run

**Recommendation:**
- Run only when needed (not on every push)
- Use `gpt-4o-mini` for cost efficiency
- Monitor usage in OpenAI dashboard

## Troubleshooting

### Server fails to start

**Symptoms:**
```
✗ Server failed to start within 30 seconds
```

**Solutions:**
1. Check server logs in workflow output
2. Verify `OPENAI_API_KEY` secret is set correctly
3. Ensure no port conflicts (3001)

### Health check fails

**Symptoms:**
```
✗ Health check failed
```

**Solutions:**
1. Verify server is running
2. Check server logs
3. Ensure `DEMO_MODE=false` is set

### Generation fails

**Symptoms:**
```
✗ HTTP status is not 200
```

**Solutions:**
1. Check OpenAI API status
2. Verify API key is valid and has credits
3. Check server logs for error details
4. Verify model name is correct

### Prompt-specific content not detected

**Symptoms:**
```
✗ Generated content does NOT contain 'Black Bean Coffee'
```

**Solutions:**
1. This indicates the AI didn't follow the prompt correctly
2. Try running again (AI responses can vary)
3. Consider using a more capable model (e.g., `gpt-4o`)

### Demo content detected

**Symptoms:**
```
✗ Generated content contains demo content 'Ember & Oak'
```

**Solutions:**
1. This indicates the system fell back to DemoProvider
2. Verify `DEMO_MODE=false` is set
3. Check server logs for provider selection
4. Ensure API key is valid

### API key exposure detected

**Symptoms:**
```
✗ CRITICAL: API key found in response!
✗ CRITICAL: API key found in server logs!
```

**Solutions:**
1. **IMMEDIATELY** rotate your OpenAI API key
2. Review server code for logging issues
3. Check error handling paths
4. This should never happen in normal operation

## Comparison with Standard CI

| Aspect | Standard CI (mvp.yml) | Real AI Verification |
|--------|----------------------|---------------------|
| Trigger | Push/PR to main | Manual only |
| Mode | DEMO_MODE=true | DEMO_MODE=false |
| AI Provider | DemoProvider | OpenAI API |
| Cost | Free | ~$0.01-0.02 per run |
| Speed | Fast (~30s) | Slower (~1-2min) |
| Purpose | Basic functionality | Real AI verification |
| Secret required | No | Yes (OPENAI_API_KEY) |

## Architecture Notes

### Provider Selection

The workflow verifies the fail-closed provider selection:

```typescript
// server/api/generate.ts
function createProvider(): AIProvider {
  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode) {
    return new DemoProvider();
  }

  // Real provider mode - require credentials
  if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL) {
    throw new GenerationError(
      'internal_error',
      'Server misconfiguration: DEMO_MODE=false but AI_API_KEY or AI_BASE_URL is not set',
      'AI provider is not configured. Please contact the administrator.'
    );
  }

  return new OpenAICompatibleProvider({
    baseUrl: process.env.AI_BASE_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  });
}
```

### System Prompt

The workflow tests the improved system prompt that emphasizes prompt-specific content:

```typescript
// src/providers/ai/openai-compatible.ts
const systemPrompt = `You are an expert web developer. Generate a complete static website based SPECIFICALLY on the user's description.

CRITICAL: The content, design, and structure must be tailored to the user's specific request. Do NOT use generic templates or sample content. Create something unique based on what they asked for.

...

IMPORTANT: Generate content that is unique and specific to what the user requested. If they ask for a coffee shop, create coffee shop content. If they ask for a portfolio, create portfolio content. Do not use the same template for every request.`;
```

## Success Criteria

The workflow is successful when:

✅ Server starts with `DEMO_MODE=false`  
✅ Health endpoint returns `mode: "production"`  
✅ Real AI generation returns HTTP 200  
✅ Generated project contains all required files  
✅ Generated HTML contains "Black Bean Coffee"  
✅ Generated HTML does NOT contain "Ember & Oak"  
✅ Generated HTML does NOT contain "burger"  
✅ API key is not in response  
✅ API key is not in server logs  

## Failure Scenarios

The workflow fails when:

❌ Server doesn't start  
❌ Health check fails  
❌ HTTP status is not 200  
❌ Response doesn't contain `success: true`  
❌ Project structure is invalid  
❌ Expected files are missing  
❌ Prompt-specific content is missing  
❌ Demo content is present  
❌ API key is exposed (CRITICAL)  

## Maintenance

### Updating the Workflow

**Change model:**
```yaml
AI_MODEL: gpt-4o  # or gpt-4o-mini, gpt-3.5-turbo, etc.
```

**Change prompt:**
Edit the `PROMPT` variable in the "Execute real AI generation test" step.

**Change verification criteria:**
Edit the grep checks in the same step.

### Rotating the API Key

1. Generate new key in OpenAI dashboard
2. Update GitHub secret: Settings → Secrets → OPENAI_API_KEY
3. No workflow changes needed
4. Test with manual workflow run

### Monitoring

- Check OpenAI dashboard for usage
- Monitor GitHub Actions for failures
- Review workflow run logs periodically
- Set up GitHub notifications for workflow failures

## Related Documentation

- [REAL_AI_IMPLEMENTATION.md](./REAL_AI_IMPLEMENTATION.md) - Implementation details
- [MVP.md](./MVP.md) - MVP status and limitations
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [CI_WORKFLOW.md](./CI_WORKFLOW.md) - Standard CI workflow

## Summary

This workflow provides a secure, manual verification path for real OpenAI API integration:

✅ **Secure:** Secret never exposed  
✅ **Manual:** Only runs when triggered  
✅ **Comprehensive:** Tests full generation flow  
✅ **Prompt-specific:** Verifies AI follows instructions  
✅ **Cost-effective:** Uses gpt-4o-mini (~$0.01/run)  
✅ **Informative:** Detailed summary report  
✅ **Safe:** Proper cleanup and error handling  

**Status:** Ready for use once `OPENAI_API_KEY` secret is configured.
