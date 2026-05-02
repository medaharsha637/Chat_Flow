import React, { useState, useEffect } from 'react';
import { User, Post, Follow } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { GlitchButton } from '../components/GlitchButton';
import { GlassCard } from '../components/GlassCard';
import { Settings, Grid, PlaySquare, Bookmark, UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileProps {
  userId: string;
}

export function Profile({ userId }: ProfileProps) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
        
        // Fetch posts
        const postsQuery = query(
          collection(db, 'posts'), 
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));

        // Check follow status
        if (currentUser && !isOwnProfile) {
          const followId = `${currentUser.uid}_${userId}`;
          const followDoc = await getDoc(doc(db, 'follows', followId));
          if (followDoc.exists()) {
            setFollowStatus(followDoc.data().status);
          } else {
            setFollowStatus('none');
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || isOwnProfile) return;
    
    const followId = `${currentUser.uid}_${userId}`;
    const followRef = doc(db, 'follows', followId);

    if (followStatus === 'none') {
      const status = user?.isPrivate ? 'pending' : 'accepted';
      await setDoc(followRef, {
        followerId: currentUser.uid,
        followingId: userId,
        status,
        createdAt: new Date().toISOString()
      });
      setFollowStatus(status);
    } else {
      await deleteDoc(followRef);
      setFollowStatus('none');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin h-6 w-6 border-b-2 border-[#00f3ff]"></div></div>;
  if (!user) return <div className="text-center p-12 font-mono text-white/50">[ USER_DATA_CORRUPTED ]</div>;

  return (
    <div className="pb-24 font-mono">
      {/* Header */}
      <GlassCard className="mb-8 border-white/10" glow="cyan">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-[#00f3ff] to-[#ff00ff] p-[2px]">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt={user.username} 
                className="w-full h-full object-cover bg-black"
              />
            </div>
            {user.online && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00f3ff] border-2 border-black shadow-[0_0_10px_#00f3ff]" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-2xl font-black italic tracking-tighter text-white">@{user.username}</h1>
              <div className="flex gap-3 justify-center md:justify-start">
                {isOwnProfile ? (
                  <GlitchButton variant="cyan" className="text-[10px] py-1 px-4">EDIT_IDENTITY</GlitchButton>
                ) : (
                  <GlitchButton 
                    variant={followStatus === 'accepted' ? 'magenta' : 'cyan'} 
                    onClick={handleFollow}
                    className="text-[10px] py-1 px-4 flex items-center gap-2"
                  >
                    {followStatus === 'accepted' ? <UserMinus size={14} /> : (followStatus === 'pending' ? <UserCheck size={14} /> : <UserPlus size={14} />)}
                    {followStatus === 'accepted' ? 'UNLINK_NODE' : (followStatus === 'pending' ? 'REQUEST_SENT' : 'LINK_NODE')}
                  </GlitchButton>
                )}
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-8 py-2 border-y border-white/5">
              <div className="text-center">
                <span className="block text-[#00f3ff] font-bold text-lg">{posts.length}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">DATA_POINTS</span>
              </div>
              <div className="text-center">
                <span className="block text-[#ff00ff] font-bold text-lg">{user.followerCount}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">SYNC_NODES</span>
              </div>
              <div className="text-center">
                <span className="block text-white font-bold text-lg">{user.followingCount}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">OUTBOUNDS</span>
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-white text-sm font-bold mb-1 uppercase tracking-wider">{user.displayName}</p>
              <p className="text-xs text-white/50 leading-relaxed italic">"{user.bio || 'Initial state pending metadata acquisition...'}"</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'posts' as const, icon: Grid, label: 'FILE_GRID' },
          { id: 'reels' as const, icon: PlaySquare, label: 'STREAM_REELS' },
          { id: 'saved' as const, icon: Bookmark, label: 'CACHE_STORE' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all min-w-max",
              activeTab === tab.id ? "text-[#00f3ff] border-b-2 border-[#00f3ff] bg-white/5" : "text-white/30 hover:text-white/60"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8">
        {posts.length > 0 ? (
          posts
            .filter(p => activeTab === 'reels' ? p.type === 'reel' : p.type === 'post')
            .map(post => (
              <PostCard key={post.id} post={post} />
            ))
        ) : (
          <div className="text-center py-24 text-white/20 italic text-[10px] uppercase tracking-widest">
            [ EMPTY_DIRECTORY_SECTOR ]
          </div>
        )}
      </div>
    </div>
  );
}
