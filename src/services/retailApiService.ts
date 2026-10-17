/**
 * Retail Inventory & Sales API client.
 * Typed against the Express backend in /server (request and response shapes match its routes).
 */

// ---------- Types ----------
export type AppRole = 'Admin' | 'Staff';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  employeeCode?: string;
  designation?: string;
  /** Raw role string issued by the backend (e.g. StoreManager, Admin, Employee). */
  role: string;
}

export interface Product {
  _id?: string;
  id?: string;
  sku: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  availableStock: number;
  reorderLevel: number;
  unit: string;
  isActive: boolean;
  barcode?: string;
  description?: string;
}

export interface LowStockProduct extends Product {
  deficit: number;
  urgency: 'CRITICAL_OUT_OF_STOCK' | 'REORDER_REQUIRED';
}

export type MovementType =
  | 'STOCK_RECEIVED'
  | 'SALE'
  | 'MANUAL_ADJUSTMENT'
  | 'DAMAGE'
  | 'RETURN'
  | 'INITIAL_STOCK';

export type AdjustmentType = Exclude<MovementType, 'SALE' | 'INITIAL_STOCK'>;

export interface Movement {
  _id?: string;
  id?: string;
  sku: string;
  productName: string;
  movementType: MovementType;
  /** Signed: positive adds stock, negative removes it. */
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: string;
  performedBy?: { id?: string; name?: string; role?: string };
  timestamp?: string;
  createdAt?: string;
}

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'UPI / QR', 'Bank Transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface SaleItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  purchasePrice?: number;
  itemTotal: number;
}

export interface Sale {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  items: SaleItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  totalCost?: number;
  profitAmount?: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  soldBy?: { id?: string; name?: string; role?: string };
  notes?: string;
  status?: string;
  createdAt: string;
}

export interface SalesReport {
  totalRevenue: number;
  transactionCount: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  topProducts: Array<{ sku: string; name: string; quantity: number; revenue: number }>;
  salesByDay: Array<{ date: string; total: number; count: number }>;
  summary?: { totalSubtotal: number; totalDiscount: number; totalTax: number };
}

export interface ProfitReport {
  totalRevenue: number;
  netRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  salesCount: number;
  itemProfitLeaderboard: Array<{
    sku: string;
    name: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    cost: number;
    profit: number;
    marginPercent: number;
  }>;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  availableStock: number;
  reorderLevel: number;
  unit: string;
}

export interface SaleInput {
  items: Array<{ productId: string; sku: string; quantity: number }>;
  paymentMethod: PaymentMethod;
  discountPercent: number;
  taxPercent: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export const productId = (p: { _id?: string; id?: string }) => (p._id ?? p.id ?? '') as string;

// ---------- Config ----------
const TOKEN_KEY = 'retail_jwt';
const USER_KEY = 'retail_user';

/** Absolute API origin for deployments (e.g. https://api.example.com). Empty = same origin / dev proxy. */
function resolveBase(): string {
  const viteUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  const nextUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
  const raw = viteUrl || nextUrl || '';
  return /^https?:\/\//i.test(raw) ? raw.replace(/\/+$/, '') : '';
}
const API_BASE = `${resolveBase()}/api`;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Query = Record<string, string | number | undefined | null>;
const qs = (q: Query = {}) => {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'All') p.append(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

// ---------- Client ----------
class RetailApi {
  private onUnauthorized: (() => void) | null = null;

  setUnauthorizedHandler(fn: (() => void) | null) {
    this.onUnauthorized = fn;
  }

  getToken(): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  }

  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, ...(init.headers as object) } });
    } catch {
      throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
    }

    let body: any = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON response */
    }

    if (!res.ok) {
      const message = body?.message || body?.error || `Request failed (${res.status})`;
      const sessionDead = res.status === 401 || /invalid or expired/i.test(message);
      if (sessionDead && token) this.onUnauthorized?.();
      throw new ApiError(message, res.status);
    }
    return body as T;
  }

  // Auth
  async login(identifier: string, password: string): Promise<AuthUser> {
    const data = await this.request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.saveSession(data.token, data.user);
    return data.user;
  }

  // Products
  async getProducts(params: { search?: string; category?: string; status?: 'active' | 'inactive' | 'low_stock' } = {}) {
    const r = await this.request<{ data: Product[]; categories: string[] }>(`/products${qs(params)}`);
    return { products: r.data ?? [], categories: (r.categories ?? []).filter((c) => c !== 'All') };
  }

  async createProduct(input: ProductInput) {
    const r = await this.request<{ data: Product }>('/products', { method: 'POST', body: JSON.stringify(input) });
    return r.data;
  }

  async updateProduct(id: string, updates: Partial<Omit<ProductInput, 'sku' | 'availableStock'>>) {
    const r = await this.request<{ data: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    return r.data;
  }

  /** The backend toggles active/inactive on each call. */
  async toggleProductActive(id: string) {
    const r = await this.request<{ data: Product; message: string }>(`/products/${id}/deactivate`, { method: 'PATCH' });
    return r;
  }

  // Inventory
  async getLowStock() {
    const r = await this.request<{ data: LowStockProduct[] }>('/inventory/low-stock');
    return r.data ?? [];
  }

  async recordAdjustment(input: { product: Product; adjustmentType: AdjustmentType; quantity: number; reason?: string }) {
    const r = await this.request<{ message: string; product: Product; movement: Movement }>('/inventory/adjustments', {
      method: 'POST',
      body: JSON.stringify({
        productId: productId(input.product),
        sku: input.product.sku,
        adjustmentType: input.adjustmentType,
        quantity: input.quantity,
        reason: input.reason,
      }),
    });
    return r;
  }

  async getMovements(params: { movementType?: string; limit?: number } = {}) {
    const r = await this.request<{ data: Movement[] }>(`/inventory/movements${qs(params)}`);
    return r.data ?? [];
  }

  // Sales
  async createSale(input: SaleInput) {
    const r = await this.request<{ data: Sale; invoiceNumber: string; message: string }>('/sales', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return r.data;
  }

  async getSales(params: { startDate?: string; endDate?: string; search?: string; limit?: number } = {}) {
    const r = await this.request<{ data: Sale[] }>(`/sales${qs(params)}`);
    return r.data ?? [];
  }

  // Reports
  async getSalesReport(params: { startDate?: string; endDate?: string } = {}) {
    const r = await this.request<{ data: SalesReport }>(`/reports/sales${qs(params)}`);
    return r.data;
  }

  async getProfitReport(params: { startDate?: string; endDate?: string } = {}) {
    const r = await this.request<{ data: ProfitReport }>(`/reports/profit${qs(params)}`);
    return r.data;
  }
}

export const api = new RetailApi();
