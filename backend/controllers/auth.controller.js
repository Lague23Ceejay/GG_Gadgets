// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
    try {
        const mod = await import("../models/users.model.js");
        const UserModel = mod.default ?? mod;
        const { username, password } = req.body;

        const user = await UserModel.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const register = async (req, res) => {
    try {
        const mod = await import("../models/users.model.js");
        const UserModel = mod.default ?? mod;
        const { username, password, role } = req.body;

        const existing = await UserModel.getUserByUsername(username);
        if (existing) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const password_hash = await bcrypt.hash(password, 10);

        // ✅ Stored procedure returns new_id (integer)
        const newUserId = await UserModel.createUser({
            username,
            password_hash,
            role
        });

        return res.status(201).json({
            message: "User created successfully",
            user_id: newUserId
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
