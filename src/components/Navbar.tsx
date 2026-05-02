import React from 'react';
import { Search, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentPage: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const titles: Record<string, string> = {
    home: 'MAIN_SYSTEM_FEED',
    explore: 'SYNTHETIC_EXPLORER',
    reels: 'RECURSION_STREAM',
    messages: 'NEURAL_PROTOCOLS',
    profile: 'IDENTITY_CORE',
    settings: 'KERNEL_CONFIG',
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 font-mono">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xs font-bold text-white/50 tracking-[0.4em] uppercase">
          {titles[currentPage] || 'UNKNOWN_PROCESS'}
        </h2>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10 group focus-within:border-[#00f3ff]/50 transition-colors">
            <Search size={14} className="text-white/30 group-focus-within:text-[#00f3ff]" />
            <input 
              type="text" 
              placeholder="SEARCH_NODE..." 
              className="bg-transparent text-[10px] uppercase font-bold outline-none placeholder:text-white/20 w-48"
            />
          </div>

          <button className="relative text-white/50 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff00ff] rounded-full shadow-[0_0_5px_#ff00ff]" />
          </button>
        </div>
      </div>
    </header>
  );
}
