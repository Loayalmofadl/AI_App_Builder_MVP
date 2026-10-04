import type { GeneratedFile } from '../../core/contracts/types';

interface FilePanelProps {
  files: GeneratedFile[];
  selectedFile: string;
  onFileSelect: (path: string) => void;
}

const fileIcons: Record<string, string> = {
  'index.html': '🌐',
  'styles.css': '🎨',
  'app.js': '⚡',
};

const languageLabels: Record<string, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
};

export function FilePanel({ files, selectedFile, onFileSelect }: FilePanelProps) {
  const activeFile = files.find((f) => f.path === selectedFile);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* File tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/30">
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => onFileSelect(file.path)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              selectedFile === file.path
                ? 'border-orange-500 text-orange-300 bg-gray-800/50'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
            }`}
          >
            <span>{fileIcons[file.path] || '📄'}</span>
            <span>{file.path}</span>
          </button>
        ))}
      </div>

      {/* File content */}
      {activeFile && (
        <div className="flex-1 overflow-auto">
          <div className="p-3 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/20">
            <span className="text-xs text-gray-500 font-mono">
              {languageLabels[activeFile.language]} • {activeFile.content.length.toLocaleString()} chars
            </span>
          </div>
          <pre className="p-4 text-xs leading-relaxed font-mono text-gray-300 overflow-auto whitespace-pre-wrap break-words">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
