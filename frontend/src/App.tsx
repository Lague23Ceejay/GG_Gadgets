import { Routes, Route } from "react-router-dom";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
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

export function App() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
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
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
      </Route>
    </Routes>
  );
}