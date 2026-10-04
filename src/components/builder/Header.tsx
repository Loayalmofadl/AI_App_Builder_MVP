export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
          AI
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">AI App Builder</h1>
          <p className="text-xs text-gray-400">Describe it. Build it. Preview it.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">v1.0 MVP</span>
      </div>
    </header>
  );
}
