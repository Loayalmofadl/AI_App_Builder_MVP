import type { Request, Response } from 'express';
import { z } from 'zod';
import { GenerateProjectService } from '../../src/services/generate-project.js';
import { DemoProvider } from '../../src/providers/ai/demo.js';
import { OpenAICompatibleProvider } from '../../src/providers/ai/openai-compatible.js';
import type { AIProvider } from '../../src/providers/ai/provider.js';
import { GenerationError } from '../../src/core/contracts/types.js';

// Request validation schema
const GenerateRequestSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(5000, 'Prompt must be at most 5000 characters')
    .trim(),
});

/**
 * POST /api/generate
 * Accepts a prompt, generates a project using AI, returns the validated project.
 */
export async function generateHandler(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validate request body
    const validationResult = GenerateRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: {
          type: 'invalid_input',
          message: 'Invalid prompt. Must be between 10 and 5000 characters.',
        },
      });
      return;
    }

    const { prompt } = validationResult.data;

    // 2. Create the appropriate provider
    const provider = createProvider();

    // 3. Generate the project
    const service = new GenerateProjectService(provider);
    const project = await service.generate(prompt);

    // 4. Return the validated project (no secrets, no internal details)
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    handleGenerationError(error, res);
  }
}

/**
 * Create the appropriate AI provider based on environment configuration.
 */
function createProvider(): AIProvider {
  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode || !process.env.AI_API_KEY || !process.env.AI_BASE_URL) {
    return new DemoProvider();
  }

  return new OpenAICompatibleProvider({
    baseUrl: process.env.AI_BASE_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  });
}

/**
 * Normalize errors into safe, user-facing responses.
 * Never expose internal details, API keys, or stack traces.
 */
function handleGenerationError(error: unknown, res: Response): void {
  if (error instanceof GenerationError) {
    const statusCode = getStatusCode(error.type);
    res.status(statusCode).json({
      error: {
        type: error.type,
        message: error.userMessage,
      },
    });
    // Log technical details server-side (without secrets)
    console.error(`[Generation Error] ${error.type}: ${error.message}`);
    return;
  }

  // Unknown error - don't expose details
  console.error('[Unexpected Error]', error);
  res.status(500).json({
    error: {
      type: 'internal_error',
      message: 'An unexpected error occurred. Please try again.',
    },
  });
}

function getStatusCode(type: string): number {
  switch (type) {
    case 'invalid_input':
      return 400;
    case 'provider_auth_failure':
      return 401;
    case 'provider_unavailable':
    case 'provider_timeout':
      return 503;
    case 'malformed_response':
    case 'validation_failure':
      return 422;
    default:
      return 500;
  }
}
