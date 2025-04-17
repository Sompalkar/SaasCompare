"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_schema_1 = require("../schemas/auth.schema");
const router = (0, express_1.Router)();
// Public routes
router.post("/login", (0, validateRequest_1.validateRequest)(auth_schema_1.loginSchema), auth_controller_1.login);
router.post("/register", (0, validateRequest_1.validateRequest)(auth_schema_1.registerSchema), auth_controller_1.register);
router.post("/logout", auth_controller_1.logout);
router.post("/refresh-token", auth_controller_1.refreshToken);
router.post("/forgot-password", (0, validateRequest_1.validateRequest)(auth_schema_1.forgotPasswordSchema), auth_controller_1.forgotPassword);
router.post("/reset-password", (0, validateRequest_1.validateRequest)(auth_schema_1.resetPasswordSchema), auth_controller_1.resetPassword);
// Protected routes
router.get("/me", authenticate_1.authenticate, auth_controller_1.getCurrentUser);
exports.default = router;
