import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUser(doc.data() as User);
          } else {
            // Create initial user profile
            const newUser: Partial<User> = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              username: firebaseUser.email?.split('@')[0] || `user_${Math.floor(Math.random() * 10000)}`,
              photoURL: firebaseUser.photoURL || '',
              bio: '',
              isPrivate: false,
              followerCount: 0,
              followingCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              online: true,
              lastSeen: new Date().toISOString(),
            };
            setDoc(userDocRef, newUser);
          }
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const signInWithGoogle = async () => {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
