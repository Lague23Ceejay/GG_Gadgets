export interface ProductImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  attributes: Record<string, unknown>;
  categories?: string[];
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
  order_status: OrderStatus;
  total_amount: number;
  extra: Record<string, unknown>;
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
