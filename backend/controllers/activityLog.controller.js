import { getActivityLogs } from "../models/activityLog.model.js";
{/**
 * Controller for activity log-related endpoints.
 * Handles requests for retrieving all activity logs.
 */}
export const getAll = async (req, res) => {
  try {
    const data = await getActivityLogs();
    res.json(data);
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};