import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageProjectStore } from './local-storage-project-store';
import type { Project } from '../core/contracts/types';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('LocalStorageProjectStore', () => {
  let store: LocalStorageProjectStore;

  const mockProject: Project = {
    id: 'test-1',
    name: 'Test Project',
    prompt: 'Create a test project',
    files: [
      { path: 'index.html', language: 'html', content: '<html></html>' },
      { path: 'styles.css', language: 'css', content: 'body {}' },
      { path: 'app.js', language: 'javascript', content: 'console.log("test")' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    localStorageMock.clear();
    store = new LocalStorageProjectStore();
  });

  it('saves and loads a project', () => {
    store.save(mockProject);
    const loaded = store.load('test-1');

    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe('test-1');
    expect(loaded!.name).toBe('Test Project');
    expect(loaded!.files).toHaveLength(3);
  });

  it('returns null for non-existent project', () => {
    const loaded = store.load('non-existent');
    expect(loaded).toBeNull();
  });

  it('tracks current project', () => {
    store.save(mockProject);
    store.setCurrentId('test-1');

    const current = store.loadCurrent();
    expect(current).not.toBeNull();
    expect(current!.id).toBe('test-1');
  });

  it('lists all projects', () => {
    store.save(mockProject);
    store.save({ ...mockProject, id: 'test-2', name: 'Project 2' });

    const all = store.listAll();
    expect(all).toHaveLength(2);
  });

  it('updates existing project', () => {
    store.save(mockProject);
    store.save({ ...mockProject, name: 'Updated Name' });

    const loaded = store.load('test-1');
    expect(loaded!.name).toBe('Updated Name');
    expect(store.listAll()).toHaveLength(1);
  });

  it('deletes a project', () => {
    store.save(mockProject);
    store.setCurrentId('test-1');
    store.delete('test-1');

    expect(store.load('test-1')).toBeNull();
    expect(store.getCurrentId()).toBeNull();
  });

  it('returns null for loadCurrent when no current ID set', () => {
    expect(store.loadCurrent()).toBeNull();
  });
});
