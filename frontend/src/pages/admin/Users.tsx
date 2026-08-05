import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface AdminUserRow {
  user_id: number;
  username: string;
  role: "super_admin" | "store_manager" | "fulfillment";
  created_at: string;
}

const ROLE_TONE: Record<AdminUserRow["role"], "accent" | "spark" | "neutral"> = {
  super_admin: "accent",
  store_manager: "spark",
  fulfillment: "neutral",
};

const emptyForm = { username: "", password: "", role: "store_manager" as AdminUserRow["role"] };

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const openEdit = (user: AdminUserRow) => {
  setEditingId(user.user_id);
  setForm({ username: user.username, password: "", role: user.role });
  setError(null);
  setShowForm(true);
};

  const load = () => {
    setLoading(true);
    api
      .get<AdminUserRow[]>("/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
        if (editingId) {
        await api.put(`/users/${editingId}`, form);
        } else {
        await api.post("/auth/register", form);
        }
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        load();
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save account.");
    } finally {
        setSubmitting(false);
    }
    };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this account? They will no longer be able to log in.")) return;
    await api.del(`/users/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700">Staff accounts</h1>
          <p className="mt-1 text-sm text-zinc-500">{users.length} total — Super Admin only</p>
        </div>
            <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}>
                + New account
            </Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">{editingId ? "New password (optional)" : "Password"}</Label>
                <Input
                id="password"
                type="password"
                required={!editingId}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingId ? "Leave blank to keep current password" : undefined}
                />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminUserRow["role"] })}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="super_admin">Super Admin</option>
                <option value="store_manager">Store Manager</option>
                <option value="fulfillment">Fulfillment Specialist</option>
              </select>
            </div>

            {error && <p className="text-sm text-danger-500 sm:col-span-3">{error}</p>}

            <div className="flex gap-2 sm:col-span-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create account"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
            {users.map((u) => (
              <tr key={u.user_id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">
                  <Badge tone={ROLE_TONE[u.role]}>{u.role.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleArchive(u.user_id)}
                    className="text-danger-500 hover:underline"
                  >
                    Archive
                  </button>
                  <button onClick={() => openEdit(u)} className="mr-3 text-accent-500 hover:underline">
                    Edit
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}