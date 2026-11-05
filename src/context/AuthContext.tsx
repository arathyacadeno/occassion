"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  image?: string | null;
  isGoogleUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (data?: {
    email?: string;
    name?: string;
    credential?: string;
    image?: string;
    googleId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (data: {
    phoneNumber: string;
    idToken?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyPhoneOtp: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    image?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return;
        }
      }
      // If unauthorized or failed
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to sign in" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const signup = async (formData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to create account" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const loginWithGoogle = async (googleData?: {
    email?: string;
    name?: string;
    credential?: string;
    image?: string;
    googleId?: string;
  }) => {
    try {
      const payload = googleData?.credential
        ? { credential: googleData.credential }
        : googleData || {
            email: "google.user@example.com",
            name: "Google Customer",
            image: "https://lh3.googleusercontent.com/a/default-user",
          };

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Google authentication failed" };
    } catch {
      return { success: false, error: "Network error during Google authentication." };
    }
  };

  const loginWithPhone = async (phoneData: {
    phoneNumber: string;
    idToken?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(phoneData),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Phone verification failed" };
    } catch {
      return { success: false, error: "Network error during phone authentication." };
    }
  };

  const sendPhoneOtp = async (phoneNumber: string) => {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || "Failed to send OTP" };
    } catch {
      return { success: false, error: "Network error sending OTP. Please try again." };
    }
  };

  const verifyPhoneOtp = async (phoneNumber: string, otp: string) => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Invalid OTP code" };
    } catch {
      return { success: false, error: "Network error verifying OTP. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (typeof window !== "undefined") {
        try {
          const { auth } = await import("@/lib/firebase");
          const { signOut } = await import("firebase/auth");
          await signOut(auth);
        } catch {
          // ignore firebase logout errors if not initialized
        }
      }
    } catch {
      // ignore network errors – still clear local state
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    image?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Failed to update profile" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithPhone,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
