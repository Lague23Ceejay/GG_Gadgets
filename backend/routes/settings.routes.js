import express from "express";
import * as controller from "../controllers/settings.controller.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/public", controller.getPublic); // storefront checks maintenance/points on load
router.get("/order-history", controller.getOrderHistory); // public, email-gated (same trust level as order tracking)
router.put("/", verifyToken, requireRole("super_admin"), controller.update);

export default router;