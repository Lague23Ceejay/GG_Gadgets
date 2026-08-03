import express from "express";
import * as controller from "../controllers/promoEvents.controller.js";
import { validateNumeric } from "../middleware/validateId.js";
import verifyToken from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Public — storefront carousel only ever needs active events
router.get("/", controller.getActive);

// Admin — sees everything including paused events, so they can re-enable them
router.get("/admin", verifyToken, requireRole("super_admin", "store_manager"), controller.getAll);

router.post("/", verifyToken, requireRole("super_admin", "store_manager"), controller.create);
router.put("/:id", verifyToken, requireRole("super_admin", "store_manager"), validateNumeric("id"), controller.update);
router.delete("/:id", verifyToken, requireRole("super_admin", "store_manager"), validateNumeric("id"), controller.archive);

export default router;