"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, Session, AuthError, OAuthResponse } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types/user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  avatarUrl: string | null;
  userName: string | null;
  userEmail: string | null;
  provider: string | null;
  refreshRole: () => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<OAuthResponse>;
  signInWithGithub: (redirectTo?: string) => Promise<OAuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const syncRoleCookie = async (userId: string | null, userRole: UserRole | null) => {
    try {
      if (userId && userRole) {
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: userRole }),
        });
      } else {
        await fetch("/api/auth/sync", { method: "DELETE" });
      }
    } catch (err) {
      console.error("[AuthProvider] Failed to sync role cookie:", err);
    }
  };

  const fetchUserRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      await syncRoleCookie(null, null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("[AuthProvider] Error fetching role:", error.message);
        return;
      }

      if (data && data.role) {
        setRole(data.role as UserRole);
        await syncRoleCookie(currentUser.id, data.role as UserRole);
      } else {
        // Create user_role record if missing
        const metadata = currentUser.user_metadata || {};
        const fullName =
          metadata.full_name ||
          metadata.name ||
          (currentUser.email ? currentUser.email.split("@")[0] : "User");
        const avatar =
          metadata.avatar_url ||
          metadata.picture ||
          "";

        const { data: newEntry } = await supabase
          .from("user_roles")
          .insert({
            user_id: currentUser.id,
            email: currentUser.email,
            full_name: fullName,
            avatar_url: avatar,
            role: "viewer",
            status: "active",
          })
          .select("role")
          .single();

        const resolvedRole = (newEntry?.role as UserRole) || "viewer";
        setRole(resolvedRole);
        await syncRoleCookie(currentUser.id, resolvedRole);
      }
    } catch (err) {
      console.error("[AuthProvider] Exception in fetchUserRole:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user);
        } else {
          setRole(null);
          await syncRoleCookie(null, null);
        }
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user);
        } else {
          setRole(null);
          await syncRoleCookie(null, null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const avatarUrl = useMemo(() => {
    if (!user) return null;
    const metadata = user.user_metadata || {};
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

  const isAdmin = useMemo(() => {
    return role === "admin";
  }, [role]);

  const refreshRole = useCallback(async () => {
    if (user) {
      await fetchUserRole(user);
    }
  }, [user, fetchUserRole]);

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
    await syncRoleCookie(null, null);
    const result = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    return result;
  };

  const value = {
    user,
    session,
    loading,
    role,
    isAdmin,
    avatarUrl,
    userName,
    userEmail,
    provider,
    refreshRole,
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
