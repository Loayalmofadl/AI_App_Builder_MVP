import type { ProjectStore } from './project-store';
import type { Project } from '../core/contracts/types';

const STORAGE_KEY = 'ai-app-builder-projects';
const CURRENT_ID_KEY = 'ai-app-builder-current';
const MAX_PROJECTS = 20;

/**
 * LocalStorage-based project persistence.
 * Stores projects in the browser's localStorage.
 */
export class LocalStorageProjectStore implements ProjectStore {
  save(project: Project): void {
    try {
      const projects = this.getAllRaw();
      const existingIndex = projects.findIndex((p) => p.id === project.id);

      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.unshift(project);
      }

      // Limit stored projects
      const trimmed = projects.slice(0, MAX_PROJECTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save project to localStorage:', error);
    }
  }

  load(id: string): Project | null {
    try {
      const projects = this.getAllRaw();
      return projects.find((p) => p.id === id) || null;
    } catch {
      return null;
    }
  }

  loadCurrent(): Project | null {
    const currentId = this.getCurrentId();
    if (!currentId) return null;
    return this.load(currentId);
  }

  getCurrentId(): string | null {
    try {
      return localStorage.getItem(CURRENT_ID_KEY);
    } catch {
      return null;
    }
  }

  setCurrentId(id: string): void {
    try {
      localStorage.setItem(CURRENT_ID_KEY, id);
    } catch (error) {
      console.error('Failed to save current project ID:', error);
    }
  }

  delete(id: string): void {
    try {
      const projects = this.getAllRaw();
      const filtered = projects.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      // If we deleted the current project, clear current ID
      if (this.getCurrentId() === id) {
        localStorage.removeItem(CURRENT_ID_KEY);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  listAll(): Project[] {
    return this.getAllRaw();
  }

  private getAllRaw(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }
}
