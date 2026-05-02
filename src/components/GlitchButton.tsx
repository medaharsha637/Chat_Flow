import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../lib/utils';

interface GlitchButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'cyan' | 'magenta';
  glitch?: boolean;
  children?: React.ReactNode;
}

export function GlitchButton({ 
  children, 
  variant = 'cyan', 
  glitch = true,
  className,
  ...props 
}: GlitchButtonProps) {
  const baseColor = variant === 'cyan' ? 'var(--neon-cyan)' : 'var(--neon-magenta)';
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-6 py-2 font-mono font-bold uppercase transition-all duration-300",
        "border-2 bg-transparent text-white",
        variant === 'cyan' ? "border-[#00f3ff] hover:shadow-[0_0_15px_#00f3ff]" : "border-[#ff00ff] hover:shadow-[0_0_15px_#ff00ff]",
        className
      )}
      {...props}
    >
      <span className={cn(glitch && "glitch-text")} data-text={typeof children === 'string' ? children : ''}>
        {children}
      </span>
      {glitch && (
        <>
          <div className="absolute inset-0 -z-10 bg-black/50" />
          <motion.div 
            animate={{ 
              x: [0, -2, 2, -1, 1, 0],
              opacity: [0, 0.5, 0, 0.5, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className={cn(
              "absolute inset-0 border border-white opacity-0",
              "pointer-events-none"
            )}
          />
        </>
      )}
    </motion.button>
  );
}
