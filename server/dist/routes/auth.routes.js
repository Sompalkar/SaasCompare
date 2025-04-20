"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
// Protected routes
router.use(authenticate_1.authenticate);
router.post("/logout", auth_controller_1.logout);
router.get("/me", auth_controller_1.getCurrentUser);
router.put("/profile", auth_controller_1.updateProfile);
exports.default = router;
