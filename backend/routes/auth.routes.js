// routes/auth.routes.js
import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import * as validate from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/login", validate.login, AuthController.login);
router.post("/register", validate.registerUser, AuthController.register);

export default router;
