import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { motion, AnimatePresence } from 'motion/react';

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00f3ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence mode="popLayout">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 glass border-white/5 font-mono">
            <p className="text-white/40 text-sm tracking-widest">[ NO_DATA_STREAMS_FOUND ]</p>
            <p className="text-[10px] text-white/20 mt-2 italic">Awaiting node activity...</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
