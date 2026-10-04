import type { AIProvider, AIProviderConfig } from './provider';
import type { ProjectGeneration } from '../../core/contracts/types';
import { ProjectGenerationSchema } from '../../core/contracts/schemas';
import { GenerationError } from '../../core/contracts/types';

/**
 * OpenAI-compatible provider.
 * Works with any API that follows the OpenAI chat completions format.
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = 'openai-compatible';
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    if (!config.baseUrl) throw new Error('AI_BASE_URL is required');
    if (!config.apiKey) throw new Error('AI_API_KEY is required');

    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o-mini';
  }

  async generateProject(prompt: string): Promise<ProjectGeneration> {
    const systemPrompt = `You are an expert web developer. Generate a complete static website based SPECIFICALLY on the user's description.

CRITICAL: The content, design, and structure must be tailored to the user's specific request. Do NOT use generic templates or sample content. Create something unique based on what they asked for.

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "projectName": "A descriptive name for the project based on the user's request",
  "files": [
    {
      "path": "index.html",
      "language": "html",
      "content": "<complete HTML document>"
    },
    {
      "path": "styles.css",
      "language": "css",
      "content": "/* complete CSS styles */"
    },
    {
      "path": "app.js",
      "language": "javascript",
      "content": "// complete JavaScript code"
    }
  ]
}

Requirements:
- Create content SPECIFIC to the user's request (business name, products, services, etc.)
- The HTML must be a complete, valid HTML5 document
- Link to styles.css and app.js from the HTML
- Make it responsive and visually polished
- Use semantic HTML and accessible controls
- Include real, useful content (not placeholder text like "Lorem ipsum")
- Do not use external dependencies, CDNs, or frameworks
- Do not use external fonts or images that might break
- Make it look like a real professional website
- The CSS should be modern and well-structured
- The JavaScript should add interactivity (smooth scroll, animations, etc.)
- Return ONLY the JSON object, no markdown, no explanation

IMPORTANT: Generate content that is unique and specific to what the user requested. If they ask for a coffee shop, create coffee shop content. If they ask for a portfolio, create portfolio content. Do not use the same template for every request.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 8000,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new GenerationError(
          'provider_auth_failure',
          `Authentication failed: ${response.status}`,
          'AI provider authentication failed. Please check your API key configuration.'
        );
      }

      if (!response.ok) {
        throw new GenerationError(
          'provider_unavailable',
          `Provider returned ${response.status}: ${await response.text()}`,
          'The AI provider is currently unavailable. Please try again later.'
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new GenerationError(
          'malformed_response',
          'No content in AI response',
          'The AI returned an empty response. Please try again.'
        );
      }

      // Try to parse the JSON from the response
      const parsed = this.parseJSON(content);

      // Validate with Zod
      const validated = ProjectGenerationSchema.safeParse(parsed);

      if (!validated.success) {
        // Try one repair attempt
        const repaired = this.attemptRepair(content);
        if (repaired) {
          const revalidated = ProjectGenerationSchema.safeParse(repaired);
          if (revalidated.success) {
            return revalidated.data;
          }
        }

        throw new GenerationError(
          'validation_failure',
          `Validation failed: ${validated.error.message}`,
          'The AI response could not be processed into a valid project. Please try again.'
        );
      }

      return validated.data;
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new GenerationError(
          'provider_unavailable',
          `Network error: ${error.message}`,
          'Cannot connect to the AI provider. Please check your connection and try again.'
        );
      }

      throw new GenerationError(
        'internal_error',
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        'An unexpected error occurred. Please try again.'
      );
    }
  }

  private parseJSON(content: string): unknown {
    // Try direct parse
    try {
      return JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {
          // Fall through
        }
      }

      // Try to find JSON object in the content
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch {
          // Fall through
        }
      }

      throw new GenerationError(
        'malformed_response',
        'Could not parse JSON from AI response',
        'The AI response was not in the expected format. Please try again.'
      );
    }
  }

  private attemptRepair(content: string): unknown | null {
    try {
      // Try to fix common issues like trailing commas
      let cleaned = content;
      const jsonMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        cleaned = jsonMatch[1].trim();
      } else {
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          cleaned = objectMatch[0];
        }
      }

      // Remove trailing commas before } or ]
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}
