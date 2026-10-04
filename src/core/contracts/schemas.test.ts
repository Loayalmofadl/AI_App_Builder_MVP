import { describe, it, expect } from 'vitest';
import { ProjectGenerationSchema } from './schemas';

describe('ProjectGeneration Schema Validation', () => {
  it('accepts a valid project generation', () => {
    const input = {
      projectName: 'Test Project',
      files: [
        { path: 'index.html', language: 'html' as const, content: '<html></html>' },
        { path: 'styles.css', language: 'css' as const, content: 'body {}' },
        { path: 'app.js', language: 'javascript' as const, content: 'console.log("hi")' },
      ],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty projectName', () => {
    const input = {
      projectName: '',
      files: [
        { path: 'index.html', language: 'html' as const, content: '<html></html>' },
      ],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty files array', () => {
    const input = {
      projectName: 'Test',
      files: [],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects duplicate file paths', () => {
    const input = {
      projectName: 'Test',
      files: [
        { path: 'index.html', language: 'html' as const, content: '<html></html>' },
        { path: 'index.html', language: 'html' as const, content: '<html>duplicate</html>' },
      ],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects unsupported file paths', () => {
    const input = {
      projectName: 'Test',
      files: [
        { path: 'evil.sh', language: 'javascript' as const, content: 'rm -rf /' },
      ],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const input = {
      projectName: 'Test',
      files: [
        { path: 'index.html', language: 'html' as const, content: '' },
      ],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid language', () => {
    const input = {
      projectName: 'Test',
      files: [
        { path: 'index.html', language: 'python' as any, content: 'print("hi")' },
      ],
    };

    const result = ProjectGenerationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
