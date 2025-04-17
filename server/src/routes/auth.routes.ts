import { Router } from "express"
import {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller"
import { authenticate } from "../middleware/authenticate"
import { validateRequest } from "../middleware/validateRequest"
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema"

const router = Router()

// Public routes
router.post("/login", validateRequest(loginSchema), login)
router.post("/register", validateRequest(registerSchema), register)
router.post("/logout", logout)
router.post("/refresh-token", refreshToken)
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword)
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword)

// Protected routes
router.get("/me", authenticate, getCurrentUser)

export default router
