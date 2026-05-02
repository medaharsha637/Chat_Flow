import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Eye, MoreHorizontal } from 'lucide-react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, User } from '../types';
import { GlassCard } from './GlassCard';
import { formatDate } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [author, setAuthor] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      const userDoc = await getDoc(doc(db, 'users', post.authorId));
      if (userDoc.exists()) {
        setAuthor(userDoc.data() as User);
      }
    };
    fetchAuthor();
  }, [post.authorId]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    await updateDoc(doc(db, 'posts', post.id), {
      likesCount: increment(isLiked ? -1 : 1)
    });
  };

  return (
    <GlassCard className="p-0 border-white/10 group mb-6 overflow-visible" glow={post.type === 'reel' ? 'magenta' : 'none'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none border border-[#00f3ff]/30 overflow-hidden">
            <img 
              src={author?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username}`} 
              alt="Author" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">{author?.username || 'ANON_NODE'}</p>
            <p className="text-[9px] text-white/30 uppercase">{formatDistanceToNow(new Date(post.createdAt))} AGO</p>
          </div>
        </div>
        <button className="text-white/30 hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Media */}
      <div className="relative aspect-square md:aspect-video w-full bg-black overflow-hidden group">
        <img 
          src={post.mediaUrl} 
          alt="Post content" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {post.type === 'reel' && (
          <div className="absolute top-4 right-4 bg-[#ff00ff]/20 backdrop-blur-sm border border-[#ff00ff]/40 px-2 py-0.5 text-[9px] font-mono text-[#ff00ff] uppercase tracking-widest">
            STREAM::REEL
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`transition-all duration-300 ${isLiked ? 'text-red-500 scale-125' : 'text-white/60 hover:text-[#ff00ff]'}`}
            >
              <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''} />
            </button>
            <button className="text-white/60 hover:text-[#00f3ff] transition-colors">
              <MessageCircle size={22} />
            </button>
            <button className="text-white/60 hover:text-white transition-colors">
              <Share2 size={22} />
            </button>
          </div>
          <button className="text-white/60 hover:text-[#00f3ff] transition-colors">
            <Bookmark size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
          <span>{post.likesCount} INTERACTS</span>
          <span>{post.commentsCount} FEEDBACK_LOOPS</span>
          <span className="ml-auto flex items-center gap-1">
            <Eye size={12} /> {post.viewCount} VISIONS
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-white/80">
            <span className="font-bold text-[#00f3ff] mr-2">@{author?.username}</span>
            {post.caption}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {post.hashtags?.map(tag => (
              <span key={tag} className="text-[10px] font-mono text-[#ff00ff] opacity-60 hover:opacity-100 cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
