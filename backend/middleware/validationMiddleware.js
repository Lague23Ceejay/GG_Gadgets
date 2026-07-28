export const login = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    next();
};

export const registerUser = (req, res, next) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: "username, password, and role are required" });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ error: "password must be at least 8 characters long" });
    }

    if (!["admin", "staff"].includes(role)) {
        return res.status(400).json({ error: "role must be either 'admin' or 'staff'" });
    }

    next();
};