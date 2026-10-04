import type { AIProvider, AIProviderConfig } from './provider';
import { DemoProvider } from './demo';
import { OpenAICompatibleProvider } from './openai-compatible';

/**
 * Provider factory.
 * Selects the appropriate AI provider based on configuration.
 */
export function createProvider(config?: AIProviderConfig): AIProvider {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' ||
    !config?.apiKey ||
    !config?.baseUrl;

  if (isDemoMode) {
    return new DemoProvider();
  }

  return new OpenAICompatibleProvider(config);
}

export function getProviderConfig(): AIProviderConfig | undefined {
  const baseUrl = import.meta.env.VITE_AI_BASE_URL;
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  const model = import.meta.env.VITE_AI_MODEL;

  if (!baseUrl || !apiKey) {
    return undefined;
  }

  return { baseUrl, apiKey, model };
}
