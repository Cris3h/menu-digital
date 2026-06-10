/** Cómo se vende el producto e interpreta `price`. */
export type SellBy = 'unit' | 'weight';

export interface Product {
  _id: string;
  name: string;
  description: string;
  /** sellBy=unit → total por unidad. sellBy=weight → precio por kg. */
  price: number;
  /** Por defecto 'unit' (compatibilidad con productos viejos). */
  sellBy?: SellBy;
  /** Solo weight: peso fijo por unidad (costillar). Si no está, peso a elección. */
  unitWeightKg?: number;
  /** Solo weight a elección: peso mínimo del selector (default 0.5). */
  minWeightKg?: number;
  /** Solo weight a elección: paso del selector (default 0.5). */
  stepWeightKg?: number;
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

/** Método de entrega del pedido. */
export type DeliveryMethod = 'delivery' | 'pickup';

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  deliveryMethod?: DeliveryMethod;
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    priceAtOrder: number;
    weightKg?: number;
    lineTotal?: number;
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
  deliveryMethod: DeliveryMethod;
  notes?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerZipCode?: string;
  customerEmail?: string;
  deliveryMethod?: DeliveryMethod;
  items: { productId: string; quantity: number; weightKg?: number }[];
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
  sellBy?: SellBy;
  unitWeightKg?: number;
  minWeightKg?: number;
  stepWeightKg?: number;
  stock: number;
  imageUrl?: string;
  videoUrl?: string;
  category: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  sellBy?: SellBy;
  unitWeightKg?: number;
  minWeightKg?: number;
  stepWeightKg?: number;
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
