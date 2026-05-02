import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

export function Reels() {
  const [reels, setReels] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      const q = query(
        collection(db, 'posts'), 
        where('type', '==', 'reel'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setReels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    };

    fetchReels();
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-0 snap-y snap-mandatory h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
      {reels.length > 0 ? (
        reels.map(reel => (
          <div key={reel.id} className="snap-start min-h-full py-4">
            <PostCard post={reel} />
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white/20 font-mono text-[10px] uppercase tracking-widest gap-4">
          <Play size={48} className="opacity-10" />
          [ STREAM_OFFLINE ]
        </div>
      )}
    </div>
  );
}
