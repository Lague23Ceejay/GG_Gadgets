// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleRoute } from "@/components/layout/RoleRoute";
import { Home } from "@/pages/storefront/Home";
import { ProductDetail } from "@/pages/storefront/ProductDetail";
import { Cart } from "@/pages/storefront/Cart";
import { AdminLogin } from "@/pages/admin/Login";
import { Dashboard } from "@/pages/admin/Dashboard";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminCategories } from "@/pages/admin/Categories";
import { AdminCustomers } from "@/pages/admin/Customers";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminInventory } from "@/pages/admin/Inventory";
import { AdminUsers } from "@/pages/admin/Users";
import { TrackOrder } from "@/pages/storefront/TrackOrder";
import { Shop } from "@/pages/storefront/Shop";
import { AdminPromoEvents } from "@/pages/admin/PromoEvents";
import { StaffLogs } from "@/pages/admin/StaffLogs";
import { OrderHistory } from "@/pages/storefront/OrderHistory";
import { AdminSettings } from "@/pages/admin/Settings";
import { AdminRewards } from "@/pages/admin/Rewards";
import { AdminHomepageLayout } from "@/pages/admin/HomepageLayout";
import { AdminAnalytics } from "@/pages/admin/Analytics";

export function App() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/order-history" element={<OrderHistory />} />
        
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="analytics"
          element={
            <RoleRoute allowedRoles={["super_admin"]}>
              <AdminAnalytics />
            </RoleRoute>
          }
        />
        
          <Route
              path="events"
              element={
                <RoleRoute allowedRoles={["super_admin", "store_manager"]}>
                  <AdminPromoEvents />
                </RoleRoute>
              }
            />

            <Route
        path="staff-logs"
        element={
          <RoleRoute allowedRoles={["super_admin"]}>
            <StaffLogs />
          </RoleRoute>
        }
      />

        {/* Dashboard, Orders, Inventory: visible to all three roles.
            The backend still enforces per-action limits (e.g. Fulfillment
            can update order status but not archive it) — this route-level
            gating is just about which pages render at all. */}
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />

        <Route
            path="homepage-layout"
            element={
              <RoleRoute allowedRoles={["super_admin"]}>
                <AdminHomepageLayout />
              </RoleRoute>
            }
          />

        {/* Catalog management: Super Admin + Store Manager only */}
        <Route
          path="products"
          element={
            <RoleRoute allowedRoles={["super_admin", "store_manager"]}>
              <AdminProducts />
            </RoleRoute>
          }
        />
        <Route
          path="categories"
          element={
            <RoleRoute allowedRoles={["super_admin", "store_manager"]}>
              <AdminCategories />
            </RoleRoute>
          }
        />
        <Route
          path="customers"
          element={
            <RoleRoute allowedRoles={["super_admin", "store_manager"]}>
              <AdminCustomers />
            </RoleRoute>
          }
        />
        <Route
          path="rewards"
          element={
            <RoleRoute allowedRoles={["super_admin", "store_manager"]}>
              <AdminRewards />
            </RoleRoute>
          }
        />

        {/* User/account management: Super Admin only */}
        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={["super_admin"]}>
              <AdminUsers />
            </RoleRoute>
          }
        />
        <Route
          path="settings"
          element={
            <RoleRoute allowedRoles={["super_admin"]}>
              <AdminSettings />
            </RoleRoute>
          }
        />
      </Route>
    </Routes>
  );
}