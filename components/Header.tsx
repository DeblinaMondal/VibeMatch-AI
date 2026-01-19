import React from 'react';
import { Music, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 flex flex-col items-center justify-center text-center space-y-2">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          VibeMatch AI
        </h1>
      </div>
      <p className="text-slate-400 max-w-md text-sm md:text-base px-4">
        Upload a photo and let our AI curate the perfect soundtrack for that moment.
      </p>
    </header>
  );
};

export default Header;
