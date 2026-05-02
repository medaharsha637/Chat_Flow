import React from 'react';
import { Home as HomeIcon, Compass, PlaySquare, MessageSquare, User, Settings, PlusSquare, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  onOpenPost: () => void;
}

export function Sidebar({ currentPage, onNavigate, onOpenPost }: SidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'home', icon: HomeIcon, label: 'SYSTEM_FEED' },
    { id: 'explore', icon: Compass, label: 'WEB_EXTRACT' },
    { id: 'reels', icon: PlaySquare, label: 'STREAM_REEL' },
    { id: 'messages', icon: MessageSquare, label: 'NEURON_CHAT' },
    { id: 'profile', icon: User, label: 'IDENTITY_REF' },
    { id: 'settings', icon: Settings, label: 'SYS_CONFIG' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#0a0a0a] p-6 font-mono">
      <div className="mb-12">
        <h2 className="text-[#00f3ff] text-xl font-black italic tracking-tighter cursor-pointer" onClick={() => onNavigate('home')}>
          CF<span className="text-[#ff00ff]">_</span>FLOW
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex items-center gap-4 w-full px-4 py-3 text-sm font-bold transition-all duration-200 group relative overflow-hidden",
              currentPage === item.id 
                ? "text-[#00f3ff] bg-white/5 border-l-2 border-[#00f3ff]" 
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <item.icon size={20} />
            <span className={cn(currentPage === item.id && "neon-glow-cyan")}>{item.label}</span>
          </button>
        ))}

        <button
          onClick={onOpenPost}
          className="flex items-center gap-4 w-full px-4 py-3 mt-8 text-sm font-bold text-[#ff00ff] bg-[#ff00ff]/10 hover:bg-[#ff00ff]/20 transition-all duration-200 border border-[#ff00ff]/20"
        >
          <PlusSquare size={20} />
          <span>UPLOAD_NULL</span>
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#00f3ff] to-[#ff00ff] rounded-none p-[2px]">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
              alt="Avatar" 
              className="w-full h-full object-cover bg-black"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate text-white">{user?.username}</p>
            <p className="text-[10px] text-white/30 truncate uppercase">ID: {user?.uid.slice(0, 8)}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3 text-sm font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>TERMINATE</span>
        </button>
      </div>
    </div>
  );
}
