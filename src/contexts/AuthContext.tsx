import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AppUser, CertificationSlug } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAppUser: () => Promise<AppUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalize legacy slugs in allowedCourses (e.g. 'cia' → 'cia-1','cia-2','cia-3')
function normalizeAllowedCourses(courses: CertificationSlug[]): CertificationSlug[] {
  const result: CertificationSlug[] = [];
  for (const c of courses) {
    if ((c as string) === 'cia') {
      if (!result.includes('cia-1')) result.push('cia-1');
      if (!result.includes('cia-2')) result.push('cia-2');
      if (!result.includes('cia-3')) result.push('cia-3');
    } else {
      if (!result.includes(c)) result.push(c);
    }
  }
  return result;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as AppUser;
            data.allowedCourses = normalizeAllowedCourses(data.allowedCourses);
            setAppUser(data);
          } else {
            setAppUser(null);
          }
        } catch {
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as AppUser;
        data.allowedCourses = normalizeAllowedCourses(data.allowedCourses);
        setAppUser(data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      throw err;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const userData: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email!,
        displayName,
        role: 'user',
        isActive: true,
        allowedCourses: [] as CertificationSlug[],
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), userData);
      setAppUser(userData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur d'inscription";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
  };

  const refreshAppUser = async (): Promise<AppUser | null> => {
    if (!firebaseUser) return null;
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;
    const data = userDoc.data() as AppUser;
    data.allowedCourses = normalizeAllowedCourses(data.allowedCourses);
    setAppUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, error, login, register, logout, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
