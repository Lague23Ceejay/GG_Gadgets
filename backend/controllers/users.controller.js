// controllers/usersController.js
import { logActivity } from "../models/activityLog.model.js";

export const getAll = async (req, res) => {
  try {
    const mod = await import('../models/users.model.js');
    const UserModel = mod.default ?? mod;
    const users = await UserModel.getAllUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getById = async (req, res) => {
  try {
    const mod = await import('../models/users.model.js');
    const UserModel = mod.default ?? mod;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await UserModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const archive = async (req, res) => {
  try {
    const mod = await import('../models/users.model.js');
    const UserModel = mod.default ?? mod;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const success = await UserModel.archiveUser(id);

    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    logActivity(req.user, "Archived staff account", { target_user_id: id });

    return res.json({ success });
  } catch (err) {
    console.error("Error archiving user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const update = async (req, res) => {
  try {
    const mod = await import('../models/users.model.js');
    const UserModel = mod.default ?? mod;
    const bcrypt = (await import('bcryptjs')).default;

    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { username, password, role } = req.body || {};
    if (!username || !role) {
      return res.status(400).json({ error: "username and role are required" });
    }

    const VALID_ROLES = ["super_admin", "store_manager", "fulfillment"];
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });
    }

    // Password is optional on edit — only re-hash and update it if a new one was typed
    let password_hash = null;
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: "password must be at least 8 characters long" });
      }
      password_hash = await bcrypt.hash(password, 10);
    }

    const success = await UserModel.updateUser({ user_id: id, username, password_hash, role });

    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    logActivity(req.user, "Updated staff account", { target_user_id: id, username, role });

    return res.json({ success });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};