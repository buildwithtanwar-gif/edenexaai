import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  authError: null,
  signIn: async () => ({ success: false, error: 'Not initialized' }),
  signOut: async () => {},
  refreshAdminStatus: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.warn('Admin role verification failed:', error.message);
        return false;
      }

      return data?.role === 'admin';
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Check active session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          const adminCheck = await checkAdminRole(session.user.id);
          if (!adminCheck) {
            // Auto sign-out authenticated non-admin user
            if (supabase) {
              await supabase.auth.signOut();
            }
            if (mounted) {
              setSession(null);
              setUser(null);
              setIsAdmin(false);
            }
          } else {
            if (mounted) {
              setSession(session);
              setUser(session.user);
              setIsAdmin(true);
            }
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
        }
      })
      .catch((err) => {
        console.error('Session retrieval error:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !currentSession?.user) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const adminCheck = await checkAdminRole(currentSession.user.id);
      if (!adminCheck) {
        // Auto sign-out authenticated non-admin user
        if (supabase) {
          await supabase.auth.signOut();
        }
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } else {
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdmin(true);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }
    const check = await checkAdminRole(user.id);
    setIsAdmin(check);
    return check;
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      const msg =
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const message =
          error.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please double check and try again.'
            : error.message;
        setAuthError(message);
        return { success: false, error: message };
      }

      if (!data.user) {
        const message = 'Authentication succeeded but user record not found.';
        setAuthError(message);
        return { success: false, error: message };
      }

      // Check admin privileges
      const adminVerified = await checkAdminRole(data.user.id);
      if (!adminVerified) {
        // Log out immediately if not an admin
        await supabase.auth.signOut();
        const unauthorizedMsg =
          'Access Denied: This account is authenticated in Supabase but lacks the "admin" role in the user_roles table. Please assign role=\'admin\' in your Supabase SQL Editor.';
        setAuthError(unauthorizedMsg);
        return { success: false, error: unauthorizedMsg };
      }

      setIsAdmin(true);
      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      const message = err?.message || 'An unexpected error occurred during sign in.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        isConfigured: isSupabaseConfigured,
        authError,
        signIn,
        signOut,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
