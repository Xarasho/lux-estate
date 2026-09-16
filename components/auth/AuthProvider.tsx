"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthError, OAuthResponse } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  avatarUrl: string | null;
  userName: string | null;
  userEmail: string | null;
  provider: string | null;
  signInWithGoogle: (redirectTo?: string) => Promise<OAuthResponse>;
  signInWithGithub: (redirectTo?: string) => Promise<OAuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const avatarUrl = useMemo(() => {
    if (!user) return null;
    const metadata = user.user_metadata || {};
    // Check avatar_url (GitHub, Google, standard), picture (Google), or identities
    return (
      metadata.avatar_url ||
      metadata.picture ||
      user.identities?.[0]?.identity_data?.avatar_url ||
      user.identities?.[0]?.identity_data?.picture ||
      null
    );
  }, [user]);

  const userName = useMemo(() => {
    if (!user) return null;
    const metadata = user.user_metadata || {};
    return (
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      user.identities?.[0]?.identity_data?.full_name ||
      user.identities?.[0]?.identity_data?.name ||
      (user.email ? user.email.split("@")[0] : "User")
    );
  }, [user]);

  const userEmail = useMemo(() => {
    return user?.email ?? null;
  }, [user]);

  const provider = useMemo(() => {
    if (!user) return null;
    return (
      user.app_metadata?.provider ||
      user.identities?.[0]?.provider ||
      null
    );
  }, [user]);

  const signInWithGoogle = async (redirectTo?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback${
      redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
    }`;

    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const signInWithGithub = async (redirectTo?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback${
      redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
    }`;

    return await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: callbackUrl,
      },
    });
  };

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return result;
  };

  const value = {
    user,
    session,
    loading,
    avatarUrl,
    userName,
    userEmail,
    provider,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
