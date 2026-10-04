import type { Project, GenerationErrorType } from '../core/contracts/types';
import { GenerationError } from '../core/contracts/types';

/**
 * API client for the AI App Builder backend.
 * All AI provider interaction happens server-side.
 * The frontend only communicates via HTTP.
 */

interface GenerateResponse {
  success: true;
  project: Project;
}

interface ApiError {
  type: GenerationErrorType;
  message: string;
  details?: Array<{ path: string; message: string }>;
}

interface ErrorResponse {
  error: ApiError;
}

const VALID_ERROR_TYPES: GenerationErrorType[] = [
  'invalid_input',
  'provider_unavailable',
  'provider_auth_failure',
  'provider_timeout',
  'malformed_response',
  'validation_failure',
  'internal_error',
];

function isValidErrorType(type: string): type is GenerationErrorType {
  return VALID_ERROR_TYPES.includes(type as GenerationErrorType);
}

export async function generateProject(prompt: string): Promise<Project> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ErrorResponse;
    const errorType = errorData.error?.type;
    const errorMessage = errorData.error?.message || 'An unexpected error occurred';

    throw new GenerationError(
      isValidErrorType(errorType) ? errorType : 'internal_error',
      errorMessage,
      errorMessage
    );
  }

  const result = data as GenerateResponse;
  return result.project;
}

export async function checkHealth(): Promise<{ status: string; mode: string }> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}
