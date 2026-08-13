import express from "express";
import * as controller from "../controllers/analytics.controller.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/overview", verifyToken, requireRole("super_admin"), controller.getOverview);
router.get("/category/:id", verifyToken, requireRole("super_admin"), controller.getCategoryDetail);

export default router;