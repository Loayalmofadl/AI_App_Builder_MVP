import { describe, it, expect } from 'vitest';
import { GenerateProjectService } from './generate-project';
import { DemoProvider } from '../providers/ai/demo';
import { GenerationError } from '../core/contracts/types';
import type { AIProvider } from '../providers/ai/provider';
import type { ProjectGeneration } from '../core/contracts/types';

describe('GenerateProjectService', () => {
  it('generates a valid project from demo provider', async () => {
    const provider = new DemoProvider();
    const service = new GenerateProjectService(provider);

    const project = await service.generate(
      'Create a modern landing page for a premium burger restaurant.'
    );

    expect(project.id).toBeTruthy();
    expect(project.name).toBeTruthy();
    expect(project.prompt).toBeTruthy();
    expect(project.files).toHaveLength(3);
    expect(project.createdAt).toBeTruthy();
    expect(project.updatedAt).toBeTruthy();
  });

  it('rejects empty prompt', async () => {
    const provider = new DemoProvider();
    const service = new GenerateProjectService(provider);

    await expect(service.generate('')).rejects.toThrow(GenerationError);
  });

  it('rejects too short prompt', async () => {
    const provider = new DemoProvider();
    const service = new GenerateProjectService(provider);

    await expect(service.generate('hi')).rejects.toThrow(GenerationError);
  });

  it('normalizes provider failures', async () => {
    const failingProvider: AIProvider = {
      name: 'failing',
      async generateProject(): Promise<ProjectGeneration> {
        throw new Error('Network error');
      },
    };

    const service = new GenerateProjectService(failingProvider);

    try {
      await service.generate('Create a valid test website with proper content');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(GenerationError);
      expect((error as GenerationError).type).toBe('internal_error');
    }
  });

  it('rejects malformed provider output', async () => {
    const malformedProvider: AIProvider = {
      name: 'malformed',
      async generateProject(): Promise<ProjectGeneration> {
        return {
          projectName: '',
          files: [],
        };
      },
    };

    const service = new GenerateProjectService(malformedProvider);

    await expect(
      service.generate('Create a valid test website with proper content')
    ).rejects.toThrow(GenerationError);
  });
});
