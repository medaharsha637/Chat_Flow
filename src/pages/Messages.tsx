import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Chat, Message, User } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Send, Image as ImageIcon, Video, User as UserIcon, ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 font-mono">
      {/* Chat List */}
      <div className={cn(
        "flex-col w-full md:w-80 space-y-4 overflow-y-auto no-scrollbar",
        selectedChatId ? "hidden md:flex" : "flex"
      )}>
        <h3 className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">AVAILABLE_CHANNELS</h3>
        {chats.length > 0 ? (
          chats.map(chat => (
            <ChatListItem 
              key={chat.id} 
              chat={chat} 
              active={selectedChatId === chat.id} 
              onClick={() => setSelectedChatId(chat.id)} 
            />
          ))
        ) : (
          <div className="glass p-8 text-center text-white/20 italic text-[10px]">[ NO_PROTOCOLS_OPEN ]</div>
        )}
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 md:flex flex-col",
        selectedChatId ? "flex" : "hidden"
      )}>
        {selectedChatId ? (
          <ChatRoom chatId={selectedChatId} onBack={() => setSelectedChatId(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center glass border-white/5 text-white/20 italic text-[10px]">
            <MessageSquare size={48} className="mb-4 opacity-10" />
            [ SELECT_A_NODE_FOR_SYNC ]
          </div>
        )}
      </div>
    </div>
  );
}

function ChatListItem({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) {
  const { user: currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchOtherUser = async () => {
      const otherId = chat.participants.find(p => p !== currentUser?.uid);
      if (otherId) {
        const userDoc = await getDoc(doc(db, 'users', otherId));
        if (userDoc.exists()) setOtherUser(userDoc.data() as User);
      }
    };
    fetchOtherUser();
  }, [chat, currentUser]);

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 transition-all duration-200 border text-left",
        active ? "bg-[#00f3ff]/10 border-[#00f3ff]" : "glass hover:bg-white/5 border-white/5"
      )}
    >
      <div className="w-10 h-10 border border-white/10 shrink-0">
        <img 
          src={otherUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username}`} 
          alt="Avatar" 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-white truncate truncate uppercase tracking-widest">{otherUser?.username || 'NODE_SYNCING'}</p>
          <span className="text-[8px] text-white/20">{chat.lastMessageAt ? formatDistanceToNow(new Date(chat.lastMessageAt)) : ''}</span>
        </div>
        <p className="text-[10px] text-white/40 truncate italic mt-1">
          {chat.lastMessage || '[ INITIALIZING_STREAM ]'}
        </p>
      </div>
    </button>
  );
}

function ChatRoom({ chatId, onBack }: { chatId: string; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchChatInfo = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        const data = chatDoc.data() as Chat;
        setChatInfo(data);
        const otherId = data.participants.find(p => p !== user?.uid);
        if (otherId) {
          const userDoc = await getDoc(doc(db, 'users', otherId));
          if (userDoc.exists()) setTargetUser(userDoc.data() as User);
        }
      }
    };
    fetchChatInfo();

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsubscribe();
  }, [chatId, user]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    const msg = inputText;
    setInputText('');

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      chatId,
      senderId: user.uid,
      text: msg,
      type: 'text',
      seen: false,
      createdAt: new Date().toISOString()
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: msg,
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="flex flex-col h-full glass border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="md:hidden text-white/50"><ArrowLeft size={20} /></button>
          <div className="w-8 h-8 border border-[#00f3ff]/30">
             <img src={targetUser?.photoURL} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#00f3ff] uppercase tracking-widest">{targetUser?.username}</h3>
            <p className="text-[9px] text-white/30 uppercase">{targetUser?.online ? 'NODE_ACTIVE' : 'OFFLINE'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={m.id} className={cn(
            "flex flex-col max-w-[80%]",
            m.senderId === user?.uid ? "ml-auto items-end" : "items-start"
          )}>
            <div className={cn(
              "px-4 py-2 text-xs",
              m.senderId === user?.uid 
                ? "bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-white italic" 
                : "bg-white/5 border border-white/10 text-white/80"
            )}>
              {m.text}
            </div>
            <span className="text-[8px] text-white/20 mt-1 uppercase">
              {formatDistanceToNow(new Date(m.createdAt))}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="SEND_COMMAND..." 
          className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-[#00f3ff]"
        />
        <button 
          onClick={handleSend}
          className="p-2 bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/20 transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
