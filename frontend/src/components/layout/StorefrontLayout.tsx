// src/components/layout/StorefrontLayout.tsx
import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function StorefrontLayout() {
  const { itemCount } = useCart();

  // 🔽 New maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    api.get<{ maintenance_mode?: boolean }>("/settings/public").then((s) => {
      setMaintenanceMode(s.maintenance_mode === true);
    });
  }, []);

  // 🔽 Gate the storefront if maintenance mode is active
  if (maintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-700">We'll be right back</h1>
          <p className="mt-2 text-zinc-500">
            The store is temporarily down for maintenance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas-light text-zinc-900 transition-theme dark:bg-canvas-dark dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-canvas-light/80 backdrop-blur transition-theme dark:border-zinc-800 dark:bg-canvas-dark/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="font-display text-lg font-700 tracking-tight">
            GG<span className="text-accent-500">.</span>Gadgets
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <Link to="/shop" className="hover:text-accent-500 transition-theme">
              Shop
            </Link>
            <Link to="/order-history" className="hover:text-accent-500 transition-theme">
              My Orders
            </Link>
            <Link to="/track-order" className="hover:text-accent-500 transition-theme">
              Track Order
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg
                text-zinc-700 hover:bg-zinc-100 transition-theme
                dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-mono font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 py-8 text-sm text-zinc-500 transition-theme dark:border-zinc-800 dark:text-zinc-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p>© {new Date().getFullYear()} GG Gadgets. Gear that keeps up with you.</p>
        </div>
      </footer>
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
