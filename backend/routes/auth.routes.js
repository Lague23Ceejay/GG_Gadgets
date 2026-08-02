// routes/auth.routes.js
import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import * as validate from "../middleware/validationMiddleware.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post("/login", validate.login, AuthController.login);

// Only an already-authenticated Super Admin can create new accounts —
// this endpoint used to be completely open, meaning anyone could self-
// register as an admin. That's the one bug fix in here beyond the new roles.
router.post(
  "/register",
  verifyToken,
  requireRole("super_admin"),
  validate.registerUser,
  AuthController.register
);

export default router;