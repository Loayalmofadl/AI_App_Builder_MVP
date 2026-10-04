/**
 * Core domain types for the AI App Builder.
 * These define the boundaries between modules.
 */

export type FileLanguage = 'html' | 'css' | 'javascript';

export interface GeneratedFile {
  path: string;
  language: FileLanguage;
  content: string;
}

export interface ProjectGeneration {
  projectName: string;
  files: GeneratedFile[];
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  files: GeneratedFile[];
  createdAt: string;
  updatedAt: string;
}

export type GenerationState = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationResult {
  state: GenerationState;
  project: Project | null;
  error: string | null;
}

export type GenerationErrorType =
  | 'invalid_input'
  | 'provider_unavailable'
  | 'provider_auth_failure'
  | 'provider_timeout'
  | 'malformed_response'
  | 'validation_failure'
  | 'internal_error';

export class GenerationError extends Error {
  constructor(
    public readonly type: GenerationErrorType,
    message: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}
