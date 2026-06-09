import { authFetch } from './auth';
import { API_URL } from './constants';
import type {
  Product,
  Category,
  Order,
  OrderStatus,
  Payment,
  PaginatedResponse,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  OverviewResult,
  DailyVisit,
  PageVisit,
  DeviceBreakdown,
  EventSummary,
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

export const adminApi = {
  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    includeInactive?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.categoryId)
      searchParams.set('categoryId', params.categoryId);
    if (params?.includeInactive)
      searchParams.set('includeInactive', 'true');
    const query = searchParams.toString();
    const res = await authFetch(
      `${API_URL}/products${query ? `?${query}` : ''}`
    );
    return handleResponse<PaginatedResponse<Product>>(res);
  },

  createProduct: async (data: CreateProductDto) => {
    const res = await authFetch(`${API_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  updateProduct: async (id: string, data: UpdateProductDto) => {
    const res = await authFetch(`${API_URL}/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  deleteProduct: async (id: string) => {
    const res = await authFetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<Product>(res);
  },

  reorderProducts: async (
    items: { _id: string; displayOrder: number }[]
  ) => {
    const res = await authFetch(`${API_URL}/products/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  getAllCategories: async (params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.includeInactive)
      searchParams.set('includeInactive', 'true');
    const query = searchParams.toString();
    const res = await authFetch(
      `${API_URL}/categories${query ? `?${query}` : ''}`
    );
    return handleResponse<PaginatedResponse<Category>>(res);
  },

  createCategory: async (data: CreateCategoryDto) => {
    const res = await authFetch(`${API_URL}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },

  updateCategory: async (id: string, data: UpdateCategoryDto) => {
    const res = await authFetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },

  deleteCategory: async (id: string) => {
    const res = await authFetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<Category>(res);
  },

  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    const res = await authFetch(
      `${API_URL}/orders${query ? `?${query}` : ''}`
    );
    return handleResponse<PaginatedResponse<Order>>(res);
  },

  getOrderById: async (id: string) => {
    const res = await authFetch(`${API_URL}/orders/${id}`);
    return handleResponse<Order>(res);
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const res = await authFetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(res);
  },

  getAllPayments: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    const res = await authFetch(
      `${API_URL}/payments${query ? `?${query}` : ''}`
    );
    return handleResponse<PaginatedResponse<Payment>>(res);
  },

  getAnalyticsOverview: async (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    const res = await authFetch(`${API_URL}/a/overview?${params}`);
    return handleResponse<OverviewResult>(res);
  },

  getAnalyticsDaily: async (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    const res = await authFetch(`${API_URL}/a/daily?${params}`);
    return handleResponse<DailyVisit[]>(res);
  },

  getAnalyticsByPage: async (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    const res = await authFetch(`${API_URL}/a/by-page?${params}`);
    return handleResponse<PageVisit[]>(res);
  },

  getAnalyticsDevices: async (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    const res = await authFetch(`${API_URL}/a/devices?${params}`);
    return handleResponse<DeviceBreakdown[]>(res);
  },

  getAnalyticsEventsSummary: async (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    const res = await authFetch(`${API_URL}/a/ev?${params}`);
    return handleResponse<EventSummary[]>(res);
  },
};
