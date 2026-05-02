import React, { useState } from 'react';
import { X, Upload, Wand2, Hash, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { GlitchButton } from './GlitchButton';
import { generateCaption, generateHashtags } from '../lib/gemini';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [type, setType] = useState<'post' | 'reel'>('post');
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleAiCaption = async () => {
    if (!caption && !hashtags) return;
    setAiGenerating(true);
    const suggested = await generateCaption(caption || hashtags);
    setCaption(suggested);
    setAiGenerating(false);
  };

  const handleAiHashtags = async () => {
    if (!caption) return;
    setAiGenerating(true);
    const suggested = await generateHashtags(caption);
    setHashtags(suggested);
    setAiGenerating(false);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `content/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const mediaUrl = await getDownloadURL(snapshot.ref);

      const postData = {
        authorId: user.uid,
        mediaUrl,
        type,
        caption,
        hashtags: hashtags.split(' ').filter(t => t.startsWith('#')).map(t => t.slice(1)),
        likesCount: 0,
        commentsCount: 0,
        viewCount: 0,
        isPrivate,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'posts'), postData);
      onClose();
      // Reset
      setFile(null);
      setPreview(null);
      setCaption('');
      setHashtags('');
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="border-white/10 p-0 overflow-hidden" glow="cyan">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="text-[#00f3ff] text-xs font-bold tracking-widest uppercase">/ NEW_DATA_ENTRY</h3>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-b md:border-b-0 md:border-r border-white/5">
              {!preview ? (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/10 hover:border-[#00f3ff]/50 hover:bg-white/5 transition-all cursor-pointer group">
                  <Upload size={32} className="text-white/20 group-hover:text-[#00f3ff] mb-4" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest group-hover:text-white mt-4">SELECT_BINARY</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                </label>
              ) : (
                <div className="relative aspect-square bg-black overflow-hidden group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-none hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button 
                  onClick={() => setType('post')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all",
                    type === 'post' ? "bg-[#00f3ff]/10 border-[#00f3ff] text-[#00f3ff]" : "border-white/10 text-white/30 hover:border-white/30"
                  )}
                >
                  ENTITY::POST
                </button>
                <button 
                  onClick={() => setType('reel')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all",
                    type === 'reel' ? "bg-[#ff00ff]/10 border-[#ff00ff] text-[#ff00ff]" : "border-white/10 text-white/30 hover:border-white/30"
                  )}
                >
                  ENTITY::REEL
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest">METADATA_CAPTION</label>
                  <button 
                    onClick={handleAiCaption}
                    disabled={aiGenerating}
                    className="flex items-center gap-1 text-[9px] text-[#00f3ff] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Wand2 size={10} /> {aiGenerating ? 'SYNTHESIZING...' : 'AI_AUGMENT'}
                  </button>
                </div>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter semantic content..."
                  className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#00f3ff] h-24 no-scrollbar resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest">INDEX_TAGS</label>
                  <button 
                    onClick={handleAiHashtags}
                    disabled={aiGenerating || !caption}
                    className="flex items-center gap-1 text-[9px] text-[#ff00ff] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Hash size={10} /> AI_INDEX
                  </button>
                </div>
                <input 
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#tag1 #tag2..."
                  className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#ff00ff]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={cn(
                      "p-2 rounded-none transition-all",
                      isPrivate ? "text-[#ff00ff] bg-[#ff00ff]/10 border border-[#ff00ff]/30" : "text-white/30 bg-white/5 border border-white/10"
                    )}
                  >
                    {isPrivate ? <Lock size={16} /> : <Globe size={16} />}
                  </button>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    {isPrivate ? 'PRIVATE_NODE' : 'PUBLIC_NODE'}
                  </span>
                </div>

                <GlitchButton 
                  onClick={handleUpload} 
                  disabled={uploading || !file}
                  variant="cyan" 
                  className="w-32 py-2 text-xs"
                >
                  {uploading ? 'UPLOADING...' : 'PUSH_COMMIT'}
                </GlitchButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
