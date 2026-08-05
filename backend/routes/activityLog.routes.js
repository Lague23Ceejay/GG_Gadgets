import express from "express";
import * as controller from "../controllers/activityLog.controller.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("super_admin"), controller.getAll);

export default router;