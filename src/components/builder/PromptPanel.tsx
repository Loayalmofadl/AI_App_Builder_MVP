import { useState, useEffect } from 'react';
import type { GenerationState } from '../../core/contracts/types';

interface PromptPanelProps {
  state: GenerationState;
  error: string | null;
  onGenerate: (prompt: string) => void;
  initialPrompt?: string;
}

export function PromptPanel({ state, error, onGenerate, initialPrompt }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');

  // Sync prompt when a project is loaded from storage
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'generating') return;
    if (prompt.trim().length < 10) return;
    onGenerate(prompt.trim());
  };

  const isGenerating = state === 'generating';

  return (
    <div className="p-4 border-b border-gray-800">
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Describe your application
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Create a modern landing page for a premium burger restaurant. Include a hero section, menu cards, special offers, testimonials, and a contact section."
          className="w-full h-32 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          disabled={isGenerating}
        />
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {prompt.length}/5000 characters
          </span>
          
          <button
            type="submit"
            disabled={isGenerating || prompt.trim().length < 10}
            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium text-sm rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>
      </form>

      {state === 'error' && error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {state === 'success' && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-300">Project generated successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}
