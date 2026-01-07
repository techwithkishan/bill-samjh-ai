/**
 * Authentication Context Provider
 * 
 * Provides global authentication state and methods throughout the app.
 * 
 * ============================================================
 * PRODUCTION NOTES
 * ============================================================
 * 
 * In production, this context would integrate with MSAL.js for Azure AD B2C:
 * 
 * ```typescript
 * import { useMsal, MsalProvider } from '@azure/msal-react';
 * import { PublicClientApplication } from '@azure/msal-browser';
 * 
 * const msalInstance = new PublicClientApplication({
 *   auth: {
 *     clientId: 'YOUR_CLIENT_ID',
 *     authority: 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/B2C_1_signupsignin',
 *     redirectUri: window.location.origin,
 *   },
 *   cache: {
 *     cacheLocation: 'sessionStorage',
 *     storeAuthStateInCookie: true,
 *   }
 * });
 * ```
 * 
 * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/enable-authentication-react-spa-app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthSession, AuthMethod } from '@/services/auth/types';
import { mockStore } from '@/services/storage/mockStore';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'billsamajh_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedSession) {
          const parsedSession: AuthSession = JSON.parse(storedSession);
          
          // Check if session is expired
          if (parsedSession.expiresAt > Date.now()) {
            setSession(parsedSession);
            setUser(parsedSession.user);
          } else {
            // Session expired, clear it
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  /**
   * Login with a new session
   * 
   * TODO: In production, validate token with Azure AD B2C
   * before accepting the session
   */
  const login = useCallback((newSession: AuthSession) => {
    setSession(newSession);
    setUser(newSession.user);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  }, []);

  /**
   * Logout and clear session
   * 
   * TODO: In production, also call msalInstance.logout()
   * to clear Azure AD B2C session
   */
  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Note: We don't clear the mock database on logout
    // as that contains all users' data
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback((updates: Partial<User>) => {
    if (user && session) {
      const updatedUser = { ...user, ...updates };
      const updatedSession = { ...session, user: updatedUser };
      
      setUser(updatedUser);
      setSession(updatedSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
      
      // Update in mock store
      mockStore.updateUser(user.id, updates);
    }
  }, [user, session]);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    login,
    logout,
    updateProfile,
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
