// routes/users.routes.js
import express from "express";
import * as UsersController from "../controllers/users.controller.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("admin"), UsersController.getAll);
router.get("/:id", verifyToken, requireRole("admin"), UsersController.getById);
router.delete("/:id", verifyToken, requireRole("admin"), UsersController.archive);

export default router;
