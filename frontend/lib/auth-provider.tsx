"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authAPI, profileAPI as userAPI } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Prevent hydration errors by only running on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      // Only run this on the client side
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const { user } = await authAPI.getCurrentUser();
            setUser(user);

            // Redirect logged-in users away from auth pages
            if (pathname?.startsWith("/auth")) {
              router.push("/dashboard");
            }
          } catch (error) {
            console.error("Authentication error:", error);
            localStorage.removeItem("token");
            setUser(null);

            // Redirect to login if on a protected route
            if (pathname?.startsWith("/dashboard")) {
              router.push("/auth/login");
            }
          }
        } else if (pathname?.startsWith("/dashboard")) {
          // Redirect to login if on a protected route and no token
          router.push("/auth/login");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [mounted, pathname]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to login with email: ${email}`);

      const response = await authAPI.login(email, password);
      const { data } = response;

      if (data && data.token) {
        // Store token safely
        localStorage.setItem("token", data.token);
        console.log(
          "Token stored after login:",
          data.token.substring(0, 10) + "..."
        );
        setUser(data);
        router.push("/dashboard");

        toast({
          title: "Login successful",
          description: `Welcome back, ${data.name}!`,
        });
      } else {
        console.error("Login response missing token or user data:", response);
        toast({
          title: "Login failed",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Specific error handling based on the type of error
      let errorMessage = "Invalid email or password";

      if (error.message === "Network Error") {
        errorMessage = "Server connection error. Please try again later.";
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || "Authentication failed";
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });

      // For network errors, we might want to allow fallback login in development
      if (
        process.env.NODE_ENV === "development" &&
        error.message === "Network Error"
      ) {
        console.log(
          "DEV MODE: Simulating successful login due to network error"
        );

        // Create a mock user for development only
        const mockUser = {
          id: "dev-user-id",
          name: "Development User",
          email: email,
          role: "user",
          plan: "free",
          token: "dev-mock-token",
        };

        localStorage.setItem("token", "dev-mock-token");
        setUser(mockUser);
        router.push("/dashboard");

        toast({
          title: "DEV MODE: Login simulated",
          description: "Login simulated due to server connectivity issues",
        });
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.register(name, email, password);
      const { data } = response;

      if (data && data.token) {
        // Store token safely
        localStorage.setItem("token", data.token);
        console.log(
          "Token stored after registration:",
          data.token.substring(0, 10) + "..."
        );
        setUser(data);
        router.push("/dashboard");

        toast({
          title: "Registration successful",
          description: `Welcome, ${data.name}!`,
        });
      } else {
        console.error(
          "Registration response missing token or user data:",
          response
        );
        toast({
          title: "Registration failed",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description:
          error.response?.data?.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const { data: updatedUser } = await userAPI.updateProfile(data);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Don't render children until mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
