import { describe, it, expect } from 'vitest';
import { composePreview } from './compose-preview';
import type { GeneratedFile } from '../core/contracts/types';

describe('Preview Composer', () => {
  it('combines files into a single HTML document', () => {
    const files: GeneratedFile[] = [
      { path: 'index.html', language: 'html', content: '<!DOCTYPE html><html><head><link rel="stylesheet" href="styles.css"></head><body><h1>Hello</h1><script src="app.js"></script></body></html>' },
      { path: 'styles.css', language: 'css', content: 'body { color: red; }' },
      { path: 'app.js', language: 'javascript', content: 'console.log("hello");' },
    ];

    const result = composePreview(files);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('body { color: red; }');
    expect(result).toContain('console.log("hello");');
    expect(result).toContain('<style>');
    expect(result).toContain('<script>');
  });

  it('replaces external stylesheet link with inline style', () => {
    const files: GeneratedFile[] = [
      { path: 'index.html', language: 'html', content: '<html><head><link rel="stylesheet" href="styles.css"></head><body></body></html>' },
      { path: 'styles.css', language: 'css', content: '.test { color: blue; }' },
      { path: 'app.js', language: 'javascript', content: '' },
    ];

    const result = composePreview(files);
    expect(result).not.toContain('href="styles.css"');
    expect(result).toContain('.test { color: blue; }');
  });

  it('replaces external script tag with inline script', () => {
    const files: GeneratedFile[] = [
      { path: 'index.html', language: 'html', content: '<html><head></head><body><script src="app.js"></script></body></html>' },
      { path: 'styles.css', language: 'css', content: '' },
      { path: 'app.js', language: 'javascript', content: 'alert("hi");' },
    ];

    const result = composePreview(files);
    expect(result).not.toContain('src="app.js"');
    expect(result).toContain('alert("hi");');
  });

  it('returns error HTML when no HTML file exists', () => {
    const files: GeneratedFile[] = [
      { path: 'styles.css', language: 'css', content: 'body {}' },
      { path: 'app.js', language: 'javascript', content: '' },
    ];

    const result = composePreview(files);
    expect(result).toContain('Error');
  });

  it('works with only HTML file (no CSS/JS)', () => {
    const files: GeneratedFile[] = [
      { path: 'index.html', language: 'html', content: '<html><body><p>Simple</p></body></html>' },
    ];

    const result = composePreview(files);
    expect(result).toContain('<p>Simple</p>');
  });
});
