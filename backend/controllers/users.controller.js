// controllers/usersController.js
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

    return res.json({ success });
  } catch (err) {
    console.error("Error archiving user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
