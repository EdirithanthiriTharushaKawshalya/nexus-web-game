"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseConfig";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isDevMode: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase not configured. Running in Development Mock mode.");
      setIsDevMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    if (isDevMode) {
      setUser({
        uid: "guest-" + Math.random().toString(36).substr(2, 5),
        displayName: "Guest Commander",
        email: "guest@nexus.com",
      });
      return;
    }

    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Failed to establish secure link.");
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    if (isDevMode) {
      setUser({ uid: "guest-mail", displayName: name, email });
      return;
    }
    if (!auth) return;
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    if (isDevMode) {
      setUser({ uid: "guest-mail", displayName: "Commander", email });
      return;
    }
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const logout = async () => {
    if (isDevMode) {
      setUser(null);
      return;
    }

    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle, 
      signupWithEmail, 
      loginWithEmail, 
      logout, 
      isDevMode, 
      authError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
