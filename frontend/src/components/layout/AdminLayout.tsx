import { Link, NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

type Role = "super_admin" | "store_manager" | "fulfillment";

const NAV_ITEMS: { to: string; label: string; end?: boolean; roles: Role[] }[] = [
  { to: "/admin", label: "Dashboard", end: true, roles: ["super_admin", "store_manager", "fulfillment"] },
  { to: "/admin/analytics", label: "Analytics", roles: ["super_admin"] },
  { to: "/admin/homepage-layout", label: "Homepage layout", roles: ["super_admin"] },
  { to: "/admin/products", label: "Products", roles: ["super_admin", "store_manager"] },
  { to: "/admin/categories", label: "Categories", roles: ["super_admin", "store_manager"] },
  { to: "/admin/customers", label: "Customers", roles: ["super_admin", "store_manager"] },
  { to: "/admin/rewards", label: "Rewards", roles: ["super_admin", "store_manager"] },
  { to: "/admin/orders", label: "Orders", roles: ["super_admin", "store_manager", "fulfillment"] },
  { to: "/admin/inventory", label: "Inventory", roles: ["super_admin", "store_manager", "fulfillment"] },
  { to: "/admin/users", label: "Staff accounts", roles: ["super_admin"] },
  { to: "/admin/events", label: "Homepage events", roles: ["super_admin", "store_manager"] },
  { to: "/admin/staff-logs", label: "Activity log", roles: ["super_admin"] },
  { to: "/admin/settings", label: "Settings", roles: ["super_admin"] },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const visibleNavItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-canvas-light text-zinc-900 transition-theme dark:bg-canvas-dark dark:text-zinc-100">
      <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-surface-light px-4 py-6 transition-theme dark:border-zinc-800 dark:bg-surface-dark sm:block">
        <Link to="/admin" className="mb-8 block font-display text-lg font-700 tracking-tight">
          GG<span className="text-accent-500">.</span>Admin
        </Link>

        <nav className="flex flex-col gap-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-theme ${
                  isActive
                    ? "bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 transition-theme dark:border-zinc-800 sm:px-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Signed in as <span className="font-medium text-zinc-800 dark:text-zinc-200">{user?.username}</span>{" "}
            <span className="font-mono text-xs">({user?.role.replace("_", " ")})</span>
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="text-sm font-medium text-zinc-600 hover:text-danger-500 transition-theme dark:text-zinc-400"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}