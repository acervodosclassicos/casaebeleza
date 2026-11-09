import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOut, registerWithEmail, signInWithEmail, sendPasswordReset } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  loginGoogle: async () => {},
  loginEmail: async () => {},
  registerEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

const BOOTSTRAP_ADMIN_EMAIL = 'wesleycorreacdm2023@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const isUserBootstrapAdmin =
        firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() && firebaseUser.emailVerified;

      const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
      const hasAdminRecord = adminSnap.exists();
      const isAuthorizedAdmin = isUserBootstrapAdmin || hasAdminRecord;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const finalRole = isAuthorizedAdmin ? 'admin' : 'customer';
        setUserProfile({
          ...data,
          role: finalRole,
        });
        setIsAdmin(finalRole === 'admin');
      } else {
        // Create initial profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Cliente',
          role: isAuthorizedAdmin ? 'admin' : 'customer',
          ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // If Firestore rules deny setting during initial boot, profile in memory is still valid
        }

        setUserProfile(newProfile);
        setIsAdmin(isAuthorizedAdmin);
      }
    } catch (err) {
      console.warn('Could not fetch user profile from Firestore, using auth fallback:', err);
      const isUserBootstrapAdmin =
        firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() && firebaseUser.emailVerified;
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Cliente',
        role: isUserBootstrapAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      });
      setIsAdmin(isUserBootstrapAdmin);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        await fetchUserProfile(res.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmail(email, password);
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const registerEmail = async (name: string, email: string, password: string) => {
    if (email.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Esta conta administrativa não pode ser criada pelo cadastro público. Entre com Google ou use a conta administrativa já configurada.');
    }
    setLoading(true);
    try {
      const res = await registerWithEmail(name, email, password);
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const logout = async () => {
    await logOut();
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        loginGoogle,
        loginEmail,
        registerEmail,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
