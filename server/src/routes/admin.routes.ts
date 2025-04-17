import { Router } from "express"
import {
  createTool,
  updateTool,
  deleteTool,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller"
import { validateRequest } from "../middleware/validateRequest"
import { createToolSchema, updateToolSchema, updateUserSchema } from "../schemas/admin.schema"
import { isAdmin } from "../middleware/isAdmin"

const router = Router()

// Admin routes (all protected by isAdmin middleware)
router.use(isAdmin)

// Tools management
router.post("/tools", validateRequest(createToolSchema), createTool)
router.patch("/tools/:id", validateRequest(updateToolSchema), updateTool)
router.delete("/tools/:id", deleteTool)

// User management
router.get("/users", getAllUsers)
router.get("/users/:id", getUserById)
router.patch("/users/:id", validateRequest(updateUserSchema), updateUser)
router.delete("/users/:id", deleteUser)

export default router
