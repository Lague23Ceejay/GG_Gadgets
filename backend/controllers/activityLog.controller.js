import { getActivityLogs } from "../models/activityLog.model.js";

export const getAll = async (req, res) => {
  try {
    const data = await getActivityLogs();
    res.json(data);
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};