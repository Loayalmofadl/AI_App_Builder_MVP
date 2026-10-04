import { describe, it, expect } from 'vitest';
import { DemoProvider } from './demo';
import type { GeneratedFile } from '../../core/contracts/types';

describe('DemoProvider', () => {
  it('returns a valid project generation', async () => {
    const provider = new DemoProvider();
    const result = await provider.generateProject(
      'Create a modern landing page for a premium burger restaurant.'
    );

    expect(result.projectName).toBeTruthy();
    expect(result.files).toHaveLength(3);
    expect(result.files.map((f: GeneratedFile) => f.path)).toEqual(['index.html', 'styles.css', 'app.js']);
  });

  it('returns HTML content in index.html', async () => {
    const provider = new DemoProvider();
    const result = await provider.generateProject('Create a portfolio website');

    const htmlFile = result.files.find((f: GeneratedFile) => f.path === 'index.html');
    expect(htmlFile).toBeDefined();
    expect(htmlFile!.language).toBe('html');
    expect(htmlFile!.content).toContain('<!DOCTYPE html>');
    expect(htmlFile!.content).toContain('</html>');
  });

  it('returns CSS content in styles.css', async () => {
    const provider = new DemoProvider();
    const result = await provider.generateProject('Create a landing page');

    const cssFile = result.files.find((f: GeneratedFile) => f.path === 'styles.css');
    expect(cssFile).toBeDefined();
    expect(cssFile!.language).toBe('css');
    expect(cssFile!.content.length).toBeGreaterThan(100);
  });

  it('returns JS content in app.js', async () => {
    const provider = new DemoProvider();
    const result = await provider.generateProject('Create a landing page');

    const jsFile = result.files.find((f: GeneratedFile) => f.path === 'app.js');
    expect(jsFile).toBeDefined();
    expect(jsFile!.language).toBe('javascript');
    expect(jsFile!.content.length).toBeGreaterThan(50);
  });

  it('has name "demo"', () => {
    const provider = new DemoProvider();
    expect(provider.name).toBe('demo');
  });
});
