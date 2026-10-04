import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { generateHandler } from './generate';

describe('Provider Selection', () => {
  let app: express.Express;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.post('/api/generate', generateHandler);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('DEMO_MODE=true', () => {
    beforeEach(() => {
      process.env.DEMO_MODE = 'true';
      // Remove credentials to ensure demo mode doesn't depend on them
      delete process.env.AI_API_KEY;
      delete process.env.AI_BASE_URL;
    });

    it('uses DemoProvider and returns valid project', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a coffee shop website' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.files).toHaveLength(3);
      
      // DemoProvider returns predictable content
      const htmlFile = response.body.project.files.find((f: any) => f.path === 'index.html');
      expect(htmlFile).toBeDefined();
      expect(htmlFile.content).toContain('<!DOCTYPE html>');
    });

    it('works even without AI credentials', async () => {
      delete process.env.AI_API_KEY;
      delete process.env.AI_BASE_URL;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a portfolio website' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DEMO_MODE=false with missing credentials', () => {
    beforeEach(() => {
      process.env.DEMO_MODE = 'false';
    });

    it('fails with configuration error when AI_API_KEY is missing', async () => {
      delete process.env.AI_API_KEY;
      process.env.AI_BASE_URL = 'https://api.openai.com/v1';

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a coffee shop website' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('internal_error');
      expect(response.body.error.message).toContain('not configured');
      
      // Should NOT fall back to demo mode
      expect(response.body.success).toBeUndefined();
      expect(response.body.project).toBeUndefined();
    });

    it('fails with configuration error when AI_BASE_URL is missing', async () => {
      process.env.AI_API_KEY = 'test-key';
      delete process.env.AI_BASE_URL;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a coffee shop website' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('internal_error');
      expect(response.body.error.message).toContain('not configured');
    });

    it('fails with configuration error when both credentials are missing', async () => {
      delete process.env.AI_API_KEY;
      delete process.env.AI_BASE_URL;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a coffee shop website' });

      expect(response.status).toBe(500);
      expect(response.body.error.type).toBe('internal_error');
    });

    it('does not silently fall back to DemoProvider', async () => {
      delete process.env.AI_API_KEY;
      delete process.env.AI_BASE_URL;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a coffee shop website' });

      // Should fail, not return demo content
      expect(response.status).not.toBe(200);
      expect(response.body.success).toBeUndefined();
      expect(response.body.project).toBeUndefined();
    });
  });

  describe('DEMO_MODE=false with valid credentials (mocked)', () => {
    beforeEach(() => {
      process.env.DEMO_MODE = 'false';
      process.env.AI_API_KEY = 'test-api-key';
      process.env.AI_BASE_URL = 'https://api.test.com/v1';
      process.env.AI_MODEL = 'test-model';
    });

    it('attempts to use OpenAICompatibleProvider', async () => {
      // Mock fetch to simulate API response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });
      
      global.fetch = mockFetch;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a coffee shop website' });

      // Should attempt to call the real provider
      expect(mockFetch).toHaveBeenCalled();
      
      // Verify the request was made to the correct endpoint
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.test.com/v1/chat/completions');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe('Bearer test-api-key');
      
      // Should return auth failure error
      expect(response.status).toBe(401);
      expect(response.body.error.type).toBe('provider_auth_failure');
    });

    it('sends the user prompt to the provider', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      });
      
      global.fetch = mockFetch;

      const testPrompt = 'Build a modern landing page for Black Bean coffee shop';
      
      await request(app)
        .post('/api/generate')
        .send({ prompt: testPrompt });

      // Verify the prompt was sent in the request body
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      
      expect(body.messages).toBeDefined();
      expect(body.messages.length).toBe(2);
      
      // System message
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[0].content).toContain('expert web developer');
      
      // User message should contain the actual prompt
      expect(body.messages[1].role).toBe('user');
      expect(body.messages[1].content).toBe(testPrompt);
      
      // Model should be from environment
      expect(body.model).toBe('test-model');
    });

    it('returns valid project when provider returns valid JSON', async () => {
      const validResponse = {
        projectName: 'Black Bean Coffee',
        files: [
          {
            path: 'index.html',
            language: 'html',
            content: '<!DOCTYPE html><html><body><h1>Black Bean Coffee</h1></body></html>'
          },
          {
            path: 'styles.css',
            language: 'css',
            content: 'body { font-family: sans-serif; }'
          },
          {
            path: 'app.js',
            language: 'javascript',
            content: 'console.log("Black Bean Coffee");'
          }
        ]
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify(validResponse)
            }
          }]
        }),
      });
      
      global.fetch = mockFetch;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Build a modern landing page for Black Bean coffee shop' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.project.name).toBe('Black Bean Coffee');
      expect(response.body.project.files).toHaveLength(3);
      
      // Verify the content is specific to the request (not demo content)
      const htmlFile = response.body.project.files.find((f: any) => f.path === 'index.html');
      expect(htmlFile.content).toContain('Black Bean Coffee');
    });

    it('rejects malformed AI output safely', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'This is not valid JSON'
            }
          }]
        }),
      });
      
      global.fetch = mockFetch;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a website' });

      expect(response.status).toBe(422);
      expect(response.body.error.type).toBe('validation_failure');
      expect(response.body.success).toBeUndefined();
    });

    it('rejects AI output with invalid file paths', async () => {
      const invalidResponse = {
        projectName: 'Test',
        files: [
          {
            path: '../evil.sh',
            language: 'javascript',
            content: 'malicious code'
          }
        ]
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify(invalidResponse)
            }
          }]
        }),
      });
      
      global.fetch = mockFetch;

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Create a website' });

      expect(response.status).toBe(422);
      expect(response.body.error.type).toBe('validation_failure');
    });
  });
});
