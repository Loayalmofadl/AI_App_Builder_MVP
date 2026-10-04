import type { AIProvider, AIProviderConfig } from './provider';
import { DemoProvider } from './demo';
import { OpenAICompatibleProvider } from './openai-compatible';

/**
 * Provider factory.
 * Selects the appropriate AI provider based on configuration.
 * 
 * NOTE: This is used by the server-side API.
 * The frontend does NOT create providers directly.
 */
export function createProvider(config?: AIProviderConfig): AIProvider {
  if (!config?.apiKey || !config?.baseUrl) {
    return new DemoProvider();
  }

  return new OpenAICompatibleProvider(config);
}

export type { AIProvider, AIProviderConfig } from './provider';
export { DemoProvider } from './demo';
export { OpenAICompatibleProvider } from './openai-compatible';
