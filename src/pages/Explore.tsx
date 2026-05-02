import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAt, endAt } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, User } from '../types';
import { PostCard } from '../components/PostCard';
import { Search, User as UserIcon, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { cn } from '../lib/utils';

export function Explore() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchExplore = async () => {
      const q = query(collection(db, 'posts'), orderBy('viewCount', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    };

    fetchExplore();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Simple prefix search for usernames
      const q = query(
        collection(db, 'users'),
        where('username', '>=', searchQuery.toLowerCase()),
        where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      setSearchResults(snapshot.docs.map(doc => doc.data() as User));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 font-mono">
      <form onSubmit={handleSearch} className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 mb-8 font-mono focus-within:border-[#00f3ff] transition-all">
        <Search size={18} className={cn("transition-colors", searchQuery ? "text-[#00f3ff]" : "text-white/20")} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="PROBE_DATABASE_FOR_ACCOUNTS..." 
          className="bg-transparent outline-none flex-1 text-xs uppercase font-bold text-white placeholder:text-white/20"
        />
        <button type="submit" className="text-[10px] text-[#00f3ff] border border-[#00f3ff]/30 px-3 py-1 hover:bg-[#00f3ff]/10">
          EXECUTE
        </button>
      </form>

      {searchQuery && (
        <div className="space-y-4 mb-12">
          <h3 className="text-[10px] text-[#00f3ff] font-bold tracking-[0.3em] uppercase">/ SEARCH_RESULTS</h3>
          <div className="grid grid-cols-1 gap-4">
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <GlassCard key={user.uid} className="p-4 border-white/5 hover:border-[#00f3ff]/30 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-white/10">
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">@{user.username}</p>
                        <p className="text-[9px] text-white/40 uppercase">{user.displayName}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-[#00f3ff] transition-colors" />
                  </div>
                </GlassCard>
              ))
            ) : (
              !isSearching && <p className="text-[10px] text-white/20 italic text-center py-4">[ NO_ACCOUNTS_IN_SECTOR ]</p>
            )}
            {isSearching && <div className="text-center py-4"><div className="animate-spin h-4 w-4 border-b-2 border-[#00f3ff] mx-auto"></div></div>}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[10px] text-white/40 font-bold tracking-[0.3em] uppercase mb-6">/ TRENDING_UPLOADS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
