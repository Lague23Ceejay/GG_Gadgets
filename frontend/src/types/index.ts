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