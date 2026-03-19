import React from 'react';
import { Wand2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">NanoEdit Studio</h1>
            <p className="text-xs text-indigo-300 font-medium">Powered by Gemini 2.5 Flash Image</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="px-3 py-1 rounded-full bg-gray-700 text-xs text-gray-300 border border-gray-600">
            v1.0.0
          </span>
        </div>
      </div>
    </header>
  );
};
