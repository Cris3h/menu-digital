import { API_URL } from './constants';
import type {
  Product,
  PaginatedResponse,
  Category,
  Order,
  LoginResponse,
} from './types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Error desconocido';
    try {
      const body = await res.json();
      message =
        body.message ||
        body.error ||
        (Array.isArray(body.message) ? body.message.join(', ') : null) ||
        message;
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    const query = searchParams.toString();
    const res = await fetch(`${API_URL}/products${query ? `?${query}` : ''}`);
    return handleResponse<PaginatedResponse<Product>>(res);
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await fetch(`${API_URL}/products/${id}`);
    return handleResponse<Product>(res);
  },

  // Categories
  getCategories: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    const res = await fetch(
      `${API_URL}/categories${query ? `?${query}` : ''}`
    );
    return handleResponse<PaginatedResponse<Category>>(res);
  },

  // Orders
  createOrder: async (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    customerZipCode?: string;
    customerEmail?: string;
    items: { productId: string; quantity: number }[];
  }) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse<Order>(res);
  },

  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(res);
  },

  // Payments
  createPaymentPreference: async (orderId: string) => {
    const res = await fetch(`${API_URL}/payments/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    return handleResponse<{ preferenceId: string; initPoint: string }>(res);
  },
};
