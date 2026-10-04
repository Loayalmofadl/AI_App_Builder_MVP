import type { Project } from '../core/contracts/types';

/**
 * ProjectStore interface.
 * Abstracts persistence so we can swap implementations later
 * (e.g., from localStorage to a database) without changing the UI.
 */
export interface ProjectStore {
  save(project: Project): void;
  load(id: string): Project | null;
  loadCurrent(): Project | null;
  getCurrentId(): string | null;
  setCurrentId(id: string): void;
  delete(id: string): void;
  listAll(): Project[];
}
