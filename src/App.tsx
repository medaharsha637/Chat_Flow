import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Reels } from './pages/Reels';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CreatePost } from './components/CreatePost';
import { Scanlines } from './components/Scanlines';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'reels' | 'messages' | 'profile' | 'settings'>('home');
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-[#00f3ff] font-mono">
        <div className="glitch-text text-2xl" data-text="LOADING_SYSTEM...">LOADING_SYSTEM...</div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'explore': return <Explore />;
      case 'reels': return <Reels />;
      case 'messages': return <Messages />;
      case 'profile': return <Profile userId={user.uid} />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <Scanlines />
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onOpenPost={() => setPostModalOpen(true)} />
      
      <main className="flex-1 overflow-y-auto relative no-scrollbar">
        <Navbar currentPage={currentPage} />
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <CreatePost isOpen={isPostModalOpen} onClose={() => setPostModalOpen(false)} />
    </div>
  );
}
