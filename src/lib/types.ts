export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  videoUrl?: string;
  category: Category;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'delivered'
  | 'cancelled';

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    priceAtOrder: number;
  }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface Payment {
  _id: string;
  orderId: string;
  preferenceId?: string;
  paymentId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  mpResponse?: {
    id?: number | string;
    status?: string;
    status_detail?: string;
    transaction_amount?: number;
    date_approved?: string | null;
    date_created?: string;
    payment_method_id?: string;
    payer?: { email?: string; id?: string };
    external_reference?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerZipCode?: string;
  customerEmail?: string;
  notes?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerZipCode?: string;
  customerEmail?: string;
  items: { productId: string; quantity: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  videoUrl?: string;
  category: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  videoUrl?: string;
  category?: string;
  active?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  active?: boolean;
}

export type AnalyticsPeriod = 'week' | 'month' | 'year';

export interface OverviewResult {
  totalVisits: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  whatsappClicks: number;
}

export interface DailyVisit {
  date: string;
  visits: number;
  uniqueVisitors: number;
}

export interface PageVisit {
  path: string;
  visits: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
}

export interface EventSummary {
  event: string;
  count: number;
}
