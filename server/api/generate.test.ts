import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { generateHandler } from './generate';

// Set demo mode for tests
process.env.DEMO_MODE = 'true';

const app = express();
app.use(express.json());
app.post('/api/generate', generateHandler);

describe('POST /api/generate', () => {
  it('accepts valid input and returns a project', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Create a modern landing page for a burger restaurant' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.project).toBeDefined();
    expect(response.body.project.id).toBeTruthy();
    expect(response.body.project.name).toBeTruthy();
    expect(response.body.project.files).toHaveLength(3);
    expect(response.body.project.prompt).toBe('Create a modern landing page for a burger restaurant');
  });

  it('rejects empty prompt', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.type).toBe('invalid_input');
  });

  it('rejects too short prompt', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'hi' });

    expect(response.status).toBe(400);
    expect(response.body.error.type).toBe('invalid_input');
  });

  it('rejects too long prompt', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'a'.repeat(5001) });

    expect(response.status).toBe(400);
    expect(response.body.error.type).toBe('invalid_input');
  });

  it('returns files with correct structure', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Create a portfolio website' });

    expect(response.status).toBe(200);
    const files = response.body.project.files;
    
    expect(files).toHaveLength(3);
    expect(files.map((f: any) => f.path)).toEqual(['index.html', 'styles.css', 'app.js']);
    
    const htmlFile = files.find((f: any) => f.path === 'index.html');
    expect(htmlFile.language).toBe('html');
    expect(htmlFile.content).toContain('<!DOCTYPE html>');
  });

  it('does not expose API keys or secrets', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Create a test website' });

    const responseText = JSON.stringify(response.body);
    
    // Ensure no environment variables are leaked
    expect(responseText).not.toContain('AI_API_KEY');
    
    if (process.env.AI_API_KEY) {
      expect(responseText).not.toContain(process.env.AI_API_KEY);
    }
    
    expect(responseText).not.toContain('sk-');
  });

  it('demo mode returns valid project without API key', async () => {
    // Ensure no API key is set
    const originalKey = process.env.AI_API_KEY;
    delete process.env.AI_API_KEY;

    const response = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Create a simple landing page' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.project.files).toHaveLength(3);

    // Restore
    if (originalKey) {
      process.env.AI_API_KEY = originalKey;
    }
  });
});
