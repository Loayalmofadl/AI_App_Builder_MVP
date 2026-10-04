import { useMemo } from 'react';
import type { Project, GenerationState } from '../../core/contracts/types';
import { composePreview } from '../../preview/compose-preview';

interface PreviewPanelProps {
  project: Project | null;
  state: GenerationState;
}

export function PreviewPanel({ project, state }: PreviewPanelProps) {
  const previewHtml = useMemo(() => {
    if (!project) return null;
    return composePreview(project.files);
  }, [project]);

  if (state === 'idle' && !project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Live Preview</h2>
          <p className="text-sm text-gray-500">
            Describe the application you want to build and click Generate.
            Your creation will appear here in real-time.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'generating') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-lg font-medium text-gray-200 mb-1">Generating your application...</h2>
          <p className="text-sm text-gray-500">The AI is crafting your project</p>
        </div>
      </div>
    );
  }

  if (state === 'error' && !project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Generation Failed</h2>
          <p className="text-sm text-gray-500">
            Something went wrong. Please check your prompt and try again.
          </p>
        </div>
      </div>
    );
  }

  if (previewHtml) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            </div>
            <span className="text-xs text-gray-500 ml-2 font-mono">
              preview://{project?.name?.toLowerCase().replace(/\s+/g, '-') || 'app'}
            </span>
          </div>
          <span className="text-xs text-gray-600">
            {project?.name}
          </span>
        </div>
        <div className="flex-1 bg-white">
          <iframe
            srcDoc={previewHtml}
            sandbox="allow-scripts"
            title="Generated application preview"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    );
  }

  return null;
}
