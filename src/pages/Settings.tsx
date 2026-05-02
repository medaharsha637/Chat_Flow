import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlitchButton } from '../components/GlitchButton';
import { Shield, User, Bell, Palette, Lock, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Settings() {
  const { user, logout } = useAuth();
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [updating, setUpdating] = useState(false);

  const togglePrivacy = async () => {
    if (!user) return;
    setUpdating(true);
    await updateDoc(doc(db, 'users', user.uid), {
      isPrivate: !isPrivate,
      updatedAt: new Date().toISOString()
    });
    setIsPrivate(!isPrivate);
    setUpdating(false);
  };

  return (
    <div className="space-y-8 pb-24 font-mono">
      <h2 className="text-xl font-black italic text-white tracking-widest border-l-4 border-[#00f3ff] pl-4 uppercase">
        KERNEL_CONFIGURATION
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <GlassCard className="col-span-1 md:col-span-2 border-white/10" glow="cyan">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-[#00f3ff]" size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">IDENTITY_INTERFACE</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-white/30 uppercase tracking-widest">DISPLAY_NAME</label>
              <input 
                type="text" 
                defaultValue={user?.displayName}
                className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#00f3ff]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/30 uppercase tracking-widest">NEURAL_BIO</label>
              <textarea 
                defaultValue={user?.bio}
                className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#00f3ff] h-24 no-scrollbar resize-none"
              />
            </div>
            <GlitchButton variant="cyan" className="text-[10px] py-1 px-4">SYNC_CHANGES</GlitchButton>
          </div>
        </GlassCard>

        {/* Privacy & Security */}
        <div className="space-y-6">
          <GlassCard className="border-white/10" glow="magenta">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-[#ff00ff]" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">SECURITY_PROTOCOLS</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/60 tracking-widest">PRIVATE_MODE</span>
                <button 
                  onClick={togglePrivacy}
                  disabled={updating}
                  className={cn(
                    "w-10 h-5 border transition-all relative",
                    isPrivate ? "border-[#ff00ff] bg-[#ff00ff]/20" : "border-white/20 bg-white/5"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-2 h-2 transition-all",
                    isPrivate ? "right-1 bg-[#ff00ff] shadow-[0_0_5px_#ff00ff]" : "left-1 bg-white/20"
                  )} />
                </button>
              </div>
              
              <button className="flex items-center justify-between w-full text-left group">
                <span className="text-[10px] text-white/60 tracking-widest group-hover:text-white">ENCRYPT_DATA</span>
                <Lock size={14} className="text-white/20 group-hover:text-[#00f3ff]" />
              </button>
            </div>
          </GlassCard>

          <GlassCard className="border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-white/50" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">INTERRUPT_LOGS</h3>
            </div>
            <p className="text-[10px] text-white/30 italic">Notification matrix active. Alert level: NOMINAL.</p>
          </GlassCard>

          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full p-4 glass border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-[0.3em]"
          >
            <LogOut size={16} />
            TERMINATE_SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
