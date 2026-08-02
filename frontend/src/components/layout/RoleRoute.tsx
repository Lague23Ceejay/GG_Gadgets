import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface RoleRouteProps {
  allowedRoles: Array<"super_admin" | "store_manager" | "fulfillment">;
  children: ReactNode;
}

/**
 * Use inside an already-authenticated <ProtectedRoute> tree to further
 * restrict a page to specific roles. If the logged-in user's role isn't
 * in allowedRoles, they're redirected to the dashboard instead of seeing
 * a blank/broken page.
 */
export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}