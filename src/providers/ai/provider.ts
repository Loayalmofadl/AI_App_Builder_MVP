import type { ProjectGeneration } from '../../core/contracts/types';

/**
 * AI Provider interface.
 * The application depends on this interface, not on any specific vendor SDK.
 */
export interface AIProvider {
  readonly name: string;
  generateProject(prompt: string): Promise<ProjectGeneration>;
}

export interface AIProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}
