"use client";

import React from 'react';

export default function Dashboard() {
  return (
    <div data-visora-src="src/components/Dashboard.tsx:7" className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <header data-visora-src="src/components/Dashboard.tsx:8" className="mb-12 text-center">
        <h1 data-visora-src="src/components/Dashboard.tsx:9" className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Next.js Visora Demo
        </h1>
        <p data-visora-src="src/components/Dashboard.tsx:12" className="text-xl text-gray-400 max-w-2xl mx-auto">
          Hover over these elements with Visora running. You should see the inspector outline them and identify the exact source file and component!
        </p>
      </header>
      
      <div data-visora-src="src/components/Dashboard.tsx:17" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div data-visora-src="src/components/Dashboard.tsx:18" className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors shadow-lg cursor-pointer">
          <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Feedback</h3>
          <p className="text-gray-400">Visora connects directly to the React Fiber tree in Next.js.</p>
        </div>
        
        <div data-visora-src="src/components/Dashboard.tsx:26" className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors shadow-lg cursor-pointer">
          <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Powered</h3>
          <p className="text-gray-400">Shift+Click to edit this component using the Visora AI Patcher.</p>
        </div>
        
        <div data-visora-src="src/components/Dashboard.tsx:34" className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-emerald-500 transition-colors shadow-lg cursor-pointer">
          <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Universal Extraction</h3>
          <p className="text-gray-400">Works in App Router and Pages Router with zero configuration.</p>
        </div>
      </div>
      
      <footer data-visora-src="src/components/Dashboard.tsx:43" className="mt-16 text-gray-500 text-sm">
        <p>Built for the Visora V2 Multi-Framework Engine.</p>
      </footer>
    </div>
  );
}
