/**
 * Authentication Context Provider
 * 
 * Uses Supabase Auth for secure server-side authentication.
 * Supports anonymous authentication for privacy-first users.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInAnonymously: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in anonymously for privacy-first users
   * This creates a proper authenticated session without requiring credentials
   */
  const signInAnonymously = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign-in error:', error);
        return { error };
      }
      return { error: null };
    } catch (err) {
      console.error('Anonymous sign-in failed:', err);
      return { error: err instanceof Error ? err : new Error('Failed to sign in') };
    }
  }, []);

  /**
   * Sign out and clear session
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    signInAnonymously,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
