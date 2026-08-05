// StaffLogs.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ActivityLog } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const ROLE_TONE: Record<string, "accent" | "spark" | "neutral"> = {
  super_admin: "accent",
  store_manager: "spark",
  fulfillment: "neutral",
};

export function StaffLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ActivityLog[]>("/activity-logs")
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Staff activity</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Most recent {logs.length} actions across the admin panel — Super Admin only.
      </p>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No activity yet.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.log_id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td className="px-4 py-3">
                  <p className="font-medium">{log.username}</p>
                  <Badge tone={ROLE_TONE[log.role] ?? "neutral"}>{log.role.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-3">
                  {log.action}
                  {Object.keys(log.details ?? {}).length > 0 && (
                    <p className="mt-0.5 font-mono text-xs text-zinc-400">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}