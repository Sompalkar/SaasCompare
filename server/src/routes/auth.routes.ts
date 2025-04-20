import { Router } from "express"
import { register, login, logout, getCurrentUser, updateProfile } from "../controllers/auth.controller"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.use(authenticate)
router.post("/logout", logout)
router.get("/me", getCurrentUser)
router.put("/profile", updateProfile)

export default router
