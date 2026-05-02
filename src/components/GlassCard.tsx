import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'magenta' | 'none';
}

export function GlassCard({ children, className, glow = 'none' }: GlassCardProps) {
  return (
    <div className={cn(
      "glass p-6 rounded-none relative overflow-hidden",
      glow === 'cyan' && "border-[#00f3ff]/30 shadow-[0_0_20px_rgba(0,243,255,0.1)]",
      glow === 'magenta' && "border-[#ff00ff]/30 shadow-[0_0_20px_rgba(255,0,255,0.1)]",
      className
    )}>
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
