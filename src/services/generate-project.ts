import type { Project, ProjectGeneration } from '../core/contracts/types';
import { GenerationError } from '../core/contracts/types';
import { ProjectGenerationSchema } from '../core/contracts/schemas';
import { validatePaths } from '../validation/paths';
import type { AIProvider } from '../providers/ai/provider';

/**
 * Generation Service.
 * Orchestrates the generation flow: prompt → AI → validate → project.
 * Does not know about UI or providers' internal details.
 */
export class GenerateProjectService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generate(prompt: string): Promise<Project> {
    // 1. Validate input
    if (!prompt || typeof prompt !== 'string') {
      throw new GenerationError(
        'invalid_input',
        'Prompt is required',
        'Please enter a description of the application you want to build.'
      );
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 10) {
      throw new GenerationError(
        'invalid_input',
        'Prompt too short',
        'Please provide a more detailed description (at least 10 characters).'
      );
    }

    if (trimmedPrompt.length > 5000) {
      throw new GenerationError(
        'invalid_input',
        'Prompt too long',
        'Your description is too long. Please keep it under 5000 characters.'
      );
    }

    // 2. Call AI provider
    let generation: ProjectGeneration;
    try {
      generation = await this.provider.generateProject(trimmedPrompt);
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        'internal_error',
        `Provider error: ${error instanceof Error ? error.message : String(error)}`,
        'The AI provider encountered an error. Please try again.'
      );
    }

    // 3. Validate output with Zod
    const validation = ProjectGenerationSchema.safeParse(generation);
    if (!validation.success) {
      throw new GenerationError(
        'validation_failure',
        `Schema validation failed: ${validation.error.message}`,
        'The generated project could not be validated. Please try again.'
      );
    }

    // 4. Validate paths for security
    const paths = validation.data.files.map((f) => f.path);
    const pathValidation = validatePaths(paths);
    if (!pathValidation.valid) {
      throw new GenerationError(
        'validation_failure',
        `Path validation failed: ${pathValidation.error}`,
        'The generated files contain invalid paths. Please try again.'
      );
    }

    // 5. Convert to Project
    const now = new Date().toISOString();
    const project: Project = {
      id: this.generateId(),
      name: validation.data.projectName,
      prompt: trimmedPrompt,
      files: validation.data.files,
      createdAt: now,
      updatedAt: now,
    };

    return project;
  }

  private generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
