/**
 * Path security validation.
 * Rejects dangerous paths that could escape project boundaries.
 */

const DANGEROUS_PATTERNS = [
  /\.\.\//,           // Directory traversal
  /\.\.\\/,           // Windows directory traversal
  /^\//,              // Unix absolute path
  /^[a-zA-Z]:\\/,     // Windows absolute path
  /\0/,               // Null bytes
  /\\/g,              // Backslashes (normalize to forward slashes)
];

export interface PathValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePath(path: string): PathValidationResult {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'Path must be a non-empty string' };
  }

  const trimmed = path.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Path cannot be empty' };
  }

  // Check for null bytes
  if (trimmed.includes('\0')) {
    return { valid: false, error: 'Path contains null bytes' };
  }

  // Check for directory traversal
  if (trimmed.includes('../') || trimmed.includes('..\\')) {
    return { valid: false, error: 'Path contains directory traversal' };
  }

  // Check for absolute paths
  if (trimmed.startsWith('/') || /^[a-zA-Z]:\\/.test(trimmed)) {
    return { valid: false, error: 'Absolute paths are not allowed' };
  }

  // Check for backslashes
  if (trimmed.includes('\\')) {
    return { valid: false, error: 'Backslashes are not allowed in paths' };
  }

  // Only allow specific files
  const allowedPaths = ['index.html', 'styles.css', 'app.js'];
  if (!allowedPaths.includes(trimmed)) {
    return { valid: false, error: `Path "${trimmed}" is not in the allowed list` };
  }

  return { valid: true };
}

export function validatePaths(paths: string[]): PathValidationResult {
  const seen = new Set<string>();

  for (const path of paths) {
    const result = validatePath(path);
    if (!result.valid) {
      return result;
    }

    if (seen.has(path)) {
      return { valid: false, error: `Duplicate path: "${path}"` };
    }
    seen.add(path);
  }

  return { valid: true };
}
