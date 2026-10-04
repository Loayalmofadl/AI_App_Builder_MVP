import { useState, useCallback, useEffect } from 'react';
import type { Project, GenerationState } from './core/contracts/types';
import { createProvider, getProviderConfig } from './providers/ai';
import { GenerateProjectService } from './services/generate-project';
import { LocalStorageProjectStore } from './storage/local-storage-project-store';
import { PromptPanel } from './components/builder/PromptPanel';
import { FilePanel } from './components/files/FilePanel';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { Header } from './components/builder/Header';

const store = new LocalStorageProjectStore();

export default function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('index.html');

  // Load persisted project on mount
  useEffect(() => {
    const saved = store.loadCurrent();
    if (saved) {
      setProject(saved);
      setState('success');
    }
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    setState('generating');
    setError(null);

    try {
      const config = getProviderConfig();
      const provider = createProvider(config);
      const service = new GenerateProjectService(provider);
      const newProject = await service.generate(prompt);

      setProject(newProject);
      setState('success');
      setSelectedFile('index.html');
      store.save(newProject);
      store.setCurrentId(newProject.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      // Check if it's a GenerationError with userMessage
      if (err && typeof err === 'object' && 'userMessage' in err) {
        setError((err as any).userMessage);
      } else {
        setError(message);
      }
      setState('error');
    }
  }, []);

  const handleFileSelect = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Header isDemoMode={!getProviderConfig()} />
      
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left panel: Prompt + Files */}
        <div className="lg:w-[420px] flex flex-col border-r border-gray-800 bg-gray-900/50">
          <PromptPanel
            state={state}
            error={error}
            onGenerate={handleGenerate}
            initialPrompt={project?.prompt}
          />
          
          {project && (
            <FilePanel
              files={project.files}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />
          )}
        </div>

        {/* Right panel: Preview */}
        <div className="flex-1 flex flex-col min-h-0">
          <PreviewPanel
            project={project}
            state={state}
          />
        </div>
      </main>
    </div>
  );
}
