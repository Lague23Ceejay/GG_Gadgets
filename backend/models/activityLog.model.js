import db from "../config/db.js";

// Fire-and-forget logger — never awaited by callers, and failures here should
// never break the actual action being logged (e.g. a broken audit log
// shouldn't stop someone from archiving a product). Errors are swallowed
// after being printed so they're visible in Render logs but harmless.
export const logActivity = (user, action, details = {}) => {
  if (!user) return;

  const query = `CALL gs_schema.sp_log_activity($1, $2, $3, $4, $5);`;

  db.query(query, [user.user_id, user.username, user.role, action, details]).catch((err) => {
    console.error("Failed to write activity log:", err);
  });
};

export const getActivityLogs = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_activity_logs(NULL, NULL);`);
  return rows[0]?.result ?? [];
};