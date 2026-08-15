// This file contains TypeScript type definitions for the GG Gadgets project. It defines interfaces for products, categories, customers, orders, admin users, cart lines, promo events, activity logs, order history items, customer order history, and public settings. These types are used throughout the frontend and backend code to ensure type safety and consistency when working with data related to the e-commerce platform.
export interface ProductImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  caption: string | null;
  created_at: string;
}

export interface Product {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  attributes: Record<string, unknown>;
  categories?: { category_id: number; name: string }[]; // was: string[]
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
  sku?: string | null;
  barcode?: string | null;
}

export interface Category {
  category_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  customer_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface OrderItem {
  order_item_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price_each: number;
  details: Record<string, unknown>;
}

export interface Order {
  order_id: number;
  customer_id: number;
  customer_name?: string; // present on list view
  order_status: OrderStatus;
  total_amount: number;
  extra: Record<string, unknown>;
  customer?: { full_name: string; email: string; phone: string | null }; // present on detail view
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
  payment_method?: string | null;
}

export interface AdminUser {
  user_id: number;
  username: string;
  role: "admin" | "staff";
  created_at: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface PromoEvent {
  event_id: number;
  title: string;
  description: string | null;
  image_url: string;
  discount_percent: number | null;
  link_url: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ActivityLog {
  log_id: number;
  user_id: number | null;
  username: string;
  role: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface OrderHistoryItem {
  order_id: number;
  order_status: OrderStatus;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
  items?: { product_name: string; quantity: number; price_each: number }[];
}

export interface CustomerOrderHistory {
  customer_id: number;
  full_name?: string;
  email?: string;
  order_count: number;
  total_spent: number;
  points: number | null;
  points_enabled: boolean;
  orders: OrderHistoryItem[];
}

export interface PublicSettings {
  points_enabled: boolean;
  points_per_currency: number;
  maintenance_mode: boolean;
}

export interface PhysicalReward {
  reward_id: number;
  item_name: string;
  point_cost: number;
  stock_count: number;
  image_url: string | null;
  is_active?: boolean;
  is_high_end: boolean;
}

export type HomepageSectionKey = "events" | "on_sale" | "best_sellers";

export interface PublicSettings {
  points_enabled: boolean;
  points_per_currency: number;
  maintenance_mode: boolean;
  homepage_layout?: HomepageSectionKey[];
}

export interface SalesKpis {
  gross_revenue: number;
  avg_order_value: number;
  rewards_fulfillment_cost: number;
}

export interface CategoryBreakdownItem {
  category_id: number;
  name: string;
  revenue: number;
  share_percent: number;
}

export interface CategoryDetail {
  category_id: number;
  name: string;
  revenue: number;
  share_percent: number;
  mom_growth_percent: number;
  max_day_revenue: number;
  min_day_revenue: number;
}

export interface ProductSalesRow {
  product_id: number;
  name: string;
  category_names: string;
  units_sold: number;
  avg_price: number;
  revenue: number;
}

export interface RewardAnalyticsRow {
  reward_id: number;
  item_name: string;
  claims_count: number;
  points_burned: number;
  wholesale_cost_total: number;
  popularity_share_percent: number;
}

export interface AnalyticsOverview {
  kpis: SalesKpis;
  category_breakdown: CategoryBreakdownItem[];
  product_table: ProductSalesRow[];
  rewards_table: RewardAnalyticsRow[];
}