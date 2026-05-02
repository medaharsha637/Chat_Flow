import React from 'react';
import { LogIn, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlitchButton } from '../components/GlitchButton';
import { motion } from 'motion/react';

export function Landing() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-4 font-mono">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#00f3ff] opacity-10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#ff00ff] opacity-10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center"
      >
        <h1 className="mb-2 text-6xl font-black italic tracking-tighter text-white md:text-8xl">
          CHAT<span className="text-[#ff00ff]">_</span>FLOW
        </h1>
        <p className="mb-12 text-sm uppercase tracking-[0.3em] text-[#00f3ff]">
          [ SOCIAL_PROTOCOL_v1.0.42 ]
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <GlitchButton onClick={signInWithGoogle} className="flex items-center gap-2">
            <LogIn size={20} />
            AUTHORIZE_ACCESS
          </GlitchButton>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          <div className="glass p-4 border-[#00f3ff]/20">
            <h3 className="text-[#00f3ff] text-xs font-bold mb-2 tracking-widest uppercase">/ CORE_ENGN</h3>
            <p className="text-xs text-white/60">Real-time neural sync between human nodes.</p>
          </div>
          <div className="glass p-4 border-[#ff00ff]/20">
            <h3 className="text-[#ff00ff] text-xs font-bold mb-2 tracking-widest uppercase">/ VIS_STREAM</h3>
            <p className="text-xs text-white/60">Vertical media recursion for the digital retina.</p>
          </div>
          <div className="glass p-4 border-white/20">
            <h3 className="text-white text-xs font-bold mb-2 tracking-widest uppercase">/ AI_AUGMENT</h3>
            <p className="text-xs text-white/60">Synthetic semantic generation. Machine-aided intent.</p>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-4 text-[10px] text-white/20 uppercase tracking-widest">
        SYSTEM_UPTIME: 99.9997% // NO_REGRETS
      </div>
    </div>
  );
}
