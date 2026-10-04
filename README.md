# AI App Builder

Describe a web application in natural language → get a working website with live preview.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and try:

> "Create a modern landing page for a premium burger restaurant. Include a hero section, menu cards, special offers, testimonials, and a contact section."

The app works in **Demo Mode** by default — no API key needed.

## Configuration

To use a real AI provider, create a `.env` file:

```
VITE_DEMO_MODE=false
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_API_KEY=sk-...
VITE_AI_MODEL=gpt-4o-mini
```

See [MVP.md](./MVP.md) for details and [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zod (validation)
- Vitest (testing)

## Project Structure

```
src/
├── core/contracts/     # Types, schemas, errors
├── providers/ai/       # AI provider abstraction + implementations
├── services/           # Generation orchestration
├── validation/         # Path security
├── preview/            # Iframe preview composer
├── storage/            # Project persistence
└── components/         # UI components
```
