"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authAPI } from "./api"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  plan: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Prevent hydration errors by only running on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // Only run this on the client side
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (token) {
            try {
              const { user } = await authAPI.getCurrentUser()
              setUser(user)
            } catch (error) {
              console.error("Authentication error:", error)
              localStorage.removeItem("token")

              // Redirect to login if on a protected route
              if (pathname?.startsWith("/dashboard")) {
                router.push("/auth/login")
              }
            }
          } else if (pathname?.startsWith("/dashboard")) {
            // Redirect to login if on a protected route and no token
            router.push("/auth/login")
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      checkAuth()
    }
  }, [mounted, pathname, router])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { token, user } = await authAPI.login(email, password)
      localStorage.setItem("token", token)
      setUser(user)
      router.push("/dashboard")
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const { token, user } = await authAPI.register(name, email, password)
      localStorage.setItem("token", token)
      setUser(user)
      router.push("/dashboard")
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}!`,
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Could not create account",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authAPI.logout()
      localStorage.removeItem("token")
      setUser(null)
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Don't render children until mounted to prevent hydration errors
  if (!mounted) {
    return null
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
