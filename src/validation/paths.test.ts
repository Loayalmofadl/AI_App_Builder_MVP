import { describe, it, expect } from 'vitest';
import { validatePath, validatePaths } from '../validation/paths';

describe('Path Validation', () => {
  it('accepts valid paths', () => {
    expect(validatePath('index.html').valid).toBe(true);
    expect(validatePath('styles.css').valid).toBe(true);
    expect(validatePath('app.js').valid).toBe(true);
  });

  it('rejects directory traversal', () => {
    expect(validatePath('../etc/passwd').valid).toBe(false);
    expect(validatePath('..\\windows\\system32').valid).toBe(false);
    expect(validatePath('foo/../../etc/passwd').valid).toBe(false);
  });

  it('rejects absolute paths', () => {
    expect(validatePath('/etc/passwd').valid).toBe(false);
    expect(validatePath('C:\\Windows\\System32').valid).toBe(false);
    expect(validatePath('D:\\secret.txt').valid).toBe(false);
  });

  it('rejects null bytes', () => {
    expect(validatePath('index.html\0.txt').valid).toBe(false);
    expect(validatePath('test\0').valid).toBe(false);
  });

  it('rejects backslashes', () => {
    expect(validatePath('foo\\bar').valid).toBe(false);
  });

  it('rejects empty paths', () => {
    expect(validatePath('').valid).toBe(false);
    expect(validatePath('   ').valid).toBe(false);
  });

  it('rejects unexpected file extensions', () => {
    expect(validatePath('evil.exe').valid).toBe(false);
    expect(validatePath('script.sh').valid).toBe(false);
    expect(validatePath('data.json').valid).toBe(false);
  });
});

describe('Path Collection Validation', () => {
  it('accepts valid unique paths', () => {
    const result = validatePaths(['index.html', 'styles.css', 'app.js']);
    expect(result.valid).toBe(true);
  });

  it('rejects duplicate paths', () => {
    const result = validatePaths(['index.html', 'index.html']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Duplicate');
  });

  it('rejects if any path is invalid', () => {
    const result = validatePaths(['index.html', '../evil.html']);
    expect(result.valid).toBe(false);
  });
});
