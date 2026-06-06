const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────
// Backend uses "title" for product name — normalize to "name" throughout
function normalizeProduct(p: Record<string, unknown>): Product {
  return {
    ...(p as unknown as Product),
    name: (p.name ?? p.title ?? "") as string,
  };
}

// ── Namespaced API object ──────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      request<{ message: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; refresh_token: string; user: User }>("/auth/login", {
        method: "POST", body: JSON.stringify(data),
      }),

    me: () => request<User>("/auth/me"),
  },

  products: {
    list: (params?: {
      skip?: number; limit?: number; category_id?: number;
      product_type_id?: number; size?: string; search?: string;
    }) => {
      const qs = new URLSearchParams(
        Object.entries(params || {})
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return request<ProductListResponse>(`/products${qs ? `?${qs}` : ""}`).then((r) => {
        // Normalize: backend returns { data, total }, field is "title" not "name"
        const raw = r as Record<string, unknown>;
        const items = ((raw.products ?? raw.data ?? []) as Record<string, unknown>[]).map(normalizeProduct);
        return { products: items, total: (raw.total as number) ?? items.length, skip: (raw.skip as number) ?? 0, limit: (raw.limit as number) ?? items.length };
      });
    },

    get: (id: number) =>
      request<Product | { data: Product }>(`/products/${id}`).then((r) => {
        const raw = ("data" in (r as object) ? (r as { data: Product }).data : r) as Record<string, unknown>;
        return normalizeProduct(raw);
      }),
  },

  categories: {
    list: () =>
      request<{ data: Category[] } | Category[]>("/categories").then((r) =>
        Array.isArray(r) ? r : (r as { data: Category[] }).data ?? []
      ),
  },

  productTypes: {
    byCategory: (categoryId: number) =>
      request<ProductType[]>(`/product-types/category/${categoryId}`),
  },

  cart: {
    get: () =>
      request<CartResponse | { cart_id: number; items: CartItem[]; total_items: number; total_price: number }>("/cart").then((r) => {
        const raw = r as Record<string, unknown>;
        // Normalize to { id, items }
        return {
          id: (raw.cart_id ?? raw.id ?? 0) as number,
          items: ((raw.items ?? []) as CartItem[]).map((item) => {
            const i = item as Record<string, unknown>;
            // Backend may return price as product_price or price
            return {
              ...item,
              price: (i.price ?? i.product_price ?? i.unit_price ?? 0) as number,
            } as CartItem;
          }),
        } as CartResponse;
      }),
    add: (data: { product_id: number; quantity: number }) =>
      request("/cart/add", { method: "POST", body: JSON.stringify(data) }),
    update: (cartItemId: number, quantity: number) =>
      request(`/cart/items/${cartItemId}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
    remove: (cartItemId: number) =>
      request(`/cart/items/${cartItemId}`, { method: "DELETE" }),
    clear: () => request("/cart", { method: "DELETE" }),
  },

  orders: {
    checkout: (data: CheckoutPayload) =>
      request<Order>("/orders/checkout", { method: "POST", body: JSON.stringify(data) }),

    myOrders: () =>
      request<Order[] | { data: Order[] }>("/orders").then((r) =>
        Array.isArray(r) ? r : (r as { data: Order[] }).data ?? []
      ),

    get: (id: number) =>
      request<Order | { order: Order; items: OrderItem[] } | { data: Order }>(`/orders/${id}`).then((r) => {
        const raw = r as Record<string, unknown>;
        if (raw.order) {
          const o = raw.order as Order;
          if (raw.items) o.items = raw.items as OrderItem[];
          return o;
        }
        if (raw.data) return raw.data as Order;
        return r as Order;
      }),

    adminAll: (params?: { order_number?: string; customer_email?: string; status?: string }) => {
      const qs = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v).map(([k, v]) => [k, String(v)])
      ).toString();
      return request<Order[]>(`/orders/admin/all${qs ? `?${qs}` : ""}`);
    },

    updateStatus: (id: number, status: string) =>
      request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

    cancel: (id: number) =>
      request(`/orders/${id}/cancel`, { method: "POST" }),
  },

  profile: {
    get: () => request<UserProfile>("/profile"),
    update: (data: Partial<UserProfile>) =>
      request<UserProfile>("/profile", { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
      request<{ message: string }>("/profile/change-password", { method: "PUT", body: JSON.stringify(data) }),
  },

  admin: {
    stats: () => request<AdminStats>("/admin/stats"),
  },
};

// Legacy named exports for backward compatibility
export const auth = api.auth;
export const products = api.products;
export const categories = api.categories;
export const productTypes = api.productTypes;
export const cart = api.cart;
export const orders = api.orders;
export const profile = api.profile;

// ── Types ─────────────────────────────────────────────────────────────
export interface User {
  user_id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  is_admin: boolean;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ProductType {
  id: number;
  name: string;
  description?: string;
  category_id: number;
}

export interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  size?: string;
  category_id?: number;
  product_type_id?: number;
  images: ProductImage[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_email?: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface CheckoutPayload {
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  notes?: string;
}

export interface AdminStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: { total: number; pending: number };
  customers: number;
  products: { total: number; out_of_stock: number; low_stock: number };
  top_products: { name: string; total_sold: number; revenue: number }[];
  low_stock_alerts: { id: number; name: string; stock: number }[];
  recent_orders: {
    id: number; order_number: string; customer_email: string;
    status: string; total_amount: number; created_at: string;
  }[];
}
