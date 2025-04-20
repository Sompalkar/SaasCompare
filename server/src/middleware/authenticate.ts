import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../utils/prisma"

interface JwtPayload {
  id: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string
        email: string
        role: string
      }
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check headers for token
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No auth header or incorrect format:", authHeader);
      return res.status(401).json({ success: false, message: "Unauthorized - No token provided" })
    }

    // Extract token
    const token = authHeader.split(" ")[1]
    if (!token) {
      console.log("Token extraction failed from:", authHeader);
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token format" })
    }
    
    // Get secret from environment
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error("JWT_SECRET is not configured in environment variables")
      return res.status(500).json({ success: false, message: "Server configuration error" })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, secret) as JwtPayload
      console.log("Token decoded successfully:", decoded);
      
      if (!decoded || !decoded.id) {
        console.error("Invalid token payload - missing user ID")
        return res.status(401).json({ success: false, message: "Unauthorized - Invalid token format" })
      }

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      })

      if (!user) {
        console.error(`User not found for ID: ${decoded.id}`)
        return res.status(401).json({ success: false, message: "Unauthorized - User not found" })
      }
      
      if (!user.isActive) {
        console.error(`User account inactive: ${decoded.id}`)
        return res.status(401).json({ success: false, message: "Unauthorized - Account inactive" })
      }

      // Set user properties including email and role
      req.user = {
        id: decoded.id,
        email: user.email,
        role: user.role || "USER", // Default to USER if role is not defined
      }

      next()
    } catch (error) {
      console.error("JWT verification error:", error)
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" })
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}
