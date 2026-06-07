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

async function requestFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: formData });
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

// Backend uses "order_status", "total", "customer_notes" — normalize to frontend shape
function normalizeOrder(o: Record<string, unknown>): Order {
  return {
    ...(o as unknown as Order),
    id: (o.id ?? o.order_id) as number,
    status: ((o.status ?? o.order_status ?? "pending") as string).toLowerCase(),
    total_amount: (o.total_amount ?? o.total ?? 0) as number,
    notes: (o.notes ?? o.customer_notes) as string | undefined,
    items: (o.items as OrderItem[] | undefined)?.map((item) => {
      const i = item as Record<string, unknown>;
      return {
        ...item,
        price: (i.price ?? i.product_price ?? i.unit_price ?? 0) as number,
      } as OrderItem;
    }),
  } as Order;
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
    create: (data: { name: string; description?: string }) =>
      request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  },

  productTypes: {
    byCategory: (categoryId: number) =>
      request<ProductType[]>(`/product-types/category/${categoryId}`),
  },

  cart: {
    get: () =>
      request<CartResponse | { cart_id: number; items: CartItem[]; total_items: number; total_price: number }>("/cart").then((r) => {
        const raw = r as Record<string, unknown>;
        return {
          id: (raw.cart_id ?? raw.id ?? 0) as number,
          items: ((raw.items ?? []) as CartItem[]).map((item) => {
            const i = item as Record<string, unknown>;
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
      request<Record<string, unknown>>("/orders/checkout", { method: "POST", body: JSON.stringify(data) })
        .then((r) => {
          // Backend returns { message, order: { order_id, ... } }
          const raw = r as Record<string, unknown>;
          const orderRaw = (raw.order ?? raw) as Record<string, unknown>;
          return normalizeOrder({ ...orderRaw, id: orderRaw.order_id ?? orderRaw.id });
        }),

    myOrders: () =>
      request<{ data: Record<string, unknown>[] } | Record<string, unknown>[]>("/orders").then((r) => {
        const items = Array.isArray(r) ? r : (r as { data: Record<string, unknown>[] }).data ?? [];
        return items.map(normalizeOrder);
      }),

    get: (id: number) =>
      request<Record<string, unknown>>(`/orders/${id}`).then((r) => {
        const raw = r as Record<string, unknown>;
        if (raw.order) {
          const o = raw.order as Record<string, unknown>;
          if (raw.items) o.items = raw.items as OrderItem[];
          return normalizeOrder(o);
        }
        if (raw.data) return normalizeOrder(raw.data as Record<string, unknown>);
        return normalizeOrder(raw);
      }),

    adminAll: (params?: { skip?: number; limit?: number; order_number?: string; customer_email?: string; status?: string }) => {
      const qs = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])
      ).toString();
      return request<{ data: Record<string, unknown>[]; total: number }>(`/orders/admin/all${qs ? `?${qs}` : ""}`)
        .then((r) => {
          const raw = r as Record<string, unknown>;
          const items = (raw.data ?? []) as Record<string, unknown>[];
          return { orders: items.map(normalizeOrder), total: (raw.total as number) ?? items.length };
        });
    },

    updateStatus: (id: number, order_status: string, payment_status?: string, admin_notes?: string) =>
      request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ order_status, payment_status, admin_notes }) }),

    cancel: (id: number) =>
      request(`/orders/${id}`, { method: "DELETE" }),
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

    products: {
      list: (params?: { skip?: number; limit?: number; category_id?: number; search?: string }) => {
        const qs = new URLSearchParams(
          Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])
        ).toString();
        return request<Record<string, unknown>>(`/products${qs ? `?${qs}` : ""}`).then((r) => {
          const raw = r as Record<string, unknown>;
          const items = ((raw.data ?? raw.products ?? []) as Record<string, unknown>[]).map(normalizeProduct);
          return { products: items, total: (raw.total as number) ?? items.length };
        });
      },

      create: (data: { title: string; description?: string; price: number; stock: number; size?: string; category_id?: number }) =>
        request<{ data: Product }>("/products", { method: "POST", body: JSON.stringify(data) })
          .then((r) => normalizeProduct((r.data ?? r) as Record<string, unknown>)),

      update: (id: number, data: Partial<{ title: string; description: string; price: number; stock: number; size: string; category_id: number }>) =>
        request<{ data: Product }>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) })
          .then((r) => normalizeProduct(((r as Record<string, unknown>).data ?? r) as Record<string, unknown>)),

      delete: (id: number) =>
        request(`/products/${id}`, { method: "DELETE" }),

      uploadImages: (productId: number, files: File[]) => {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        return requestFormData<{ images: ProductImage[] }>(`/uploads/products/${productId}`, fd);
      },

      deleteImage: (imageId: number) =>
        request(`/uploads/images/${imageId}`, { method: "DELETE" }),
    },
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
  created_at?: string;
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
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  notes?: string;
  admin_notes?: string;
  tracking_number?: string;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country?: string;
  notes?: string;
  send_confirmation_email?: boolean;
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
  revenue: { total_paid: number; pending_collection: number };
  users: { total_customers: number };
  products: { total: number; out_of_stock: number; low_stock: number };
  top_selling_products: { product_id: number; product_name: string; total_sold: number; total_revenue: number }[];
  low_stock_alerts: { product_id: number; title: string; stock: number }[];
  recent_orders: {
    order_id: number; order_number: string; customer_name: string;
    order_status: string; total: number; created_at: string;
  }[];
}
