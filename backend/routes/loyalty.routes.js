import express from "express";
import * as controller from "../controllers/loyalty.controller.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Public — guest checkout flow
router.get("/balance", controller.getBalance);
router.get("/rewards", controller.listActiveRewards);
router.post("/otp/request", controller.requestOtp);
router.post("/otp/verify", controller.verifyOtp);
router.post("/redeem", controller.redeem);

// Admin — rewards catalog management
router.get("/rewards/admin", verifyToken, requireRole("super_admin", "store_manager"), controller.listAllRewards);
router.post("/rewards", verifyToken, requireRole("super_admin", "store_manager"), controller.createReward);
router.put("/rewards/:id", verifyToken, requireRole("super_admin", "store_manager"), controller.updateReward);
router.delete("/rewards/:id", verifyToken, requireRole("super_admin", "store_manager"), controller.archiveReward);

export default router;