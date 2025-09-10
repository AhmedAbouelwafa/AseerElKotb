// Note: Now using ID-based system instead of enums
// import { EgyptGovernorates } from './egypt-governorates.enum';
// import { EgyptCities } from './egypt-cities.enum';
import { PaymentMethod } from './payment-method.enum';

// Base API Response Structure (reusing from cart interfaces pattern)
export interface ApiResponse<T> {
  data: T;
  message: string | null;
  succeeded: boolean;
  statusCode: number;
  errors: any;
}

// Order Request Interfaces - Matching your backend AddOrderRequest
export interface AddOrderRequest {
  FirstName: string;
  LastName: string;
  StreetAddress: string;
  PhoneNumber: string;
  GovernorateId: number;
  CityId: number;
  PaymentMethod: PaymentMethod;
}

export interface CancelOrderRequest {
  trackingNumber: string;
}

export interface GetAllUserOrdersPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetUserOrderByTrackingNumberRequest {
  trackingNumber: string;
}

// Payment Status Enum
export enum PaymentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}

// Payment Initialization Info for payment gateway
export interface PaymentInitializationInfo {
  paymentId: number;
  transactionId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  redirectUrl?: string;
  instructions?: string;
  requiresRedirect: boolean;
}

// Add Order Response - New structure from backend
export interface AddOrderResponse {
  id: number;
  trackingNumber: string;
  paymentInfo?: PaymentInitializationInfo;
}

// Order Response Interfaces
export interface OrderItemResponse {
  bookId: number;
  bookTitle: string;
  coverImageUrl: string;
  unitPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  quantity: number;
  totalPrice: number;
  totalDiscountedPrice: number;
}

// export interface OrderResponse {
//   id: number;
//   trackingNumber: string;
//   userId: number;
//   firstName: string;
//   lastName: string;
//   address: string;
//   governorate: EgyptGovernorates;
//   governorateName: string;
//   city: string;
//   localPhone: string;
//   altPhone?: string;
//   orderDate: Date;
//   status: OrderStatus;
//   statusName: string;
//   items: OrderItemResponse[];
//   subtotal: number;
//   shippingCost: number;
//   totalAmount: number;
// }

export interface OrderResponse {
  id: number;
  trackingNumber: string;
  governorate: number;
  city: number;
  orderDate: Date;
  orderStatus: OrderStatus;
  finalAmount:number
  books: OrderItemResponse[];
  paymentMethod:number;
  paymentStatus:number;
  userName:string

}

export interface PaginatedOrderResponse {
  items: OrderResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Order Status Enum
export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5
}

export const OrderStatusDisplayNames: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'في الانتظار',
  [OrderStatus.Confirmed]: 'مؤكد',
  [OrderStatus.Processing]: 'قيد التحضير',
  [OrderStatus.Shipped]: 'تم الشحن',
  [OrderStatus.Delivered]: 'تم التسليم',
  [OrderStatus.Cancelled]: 'ملغي'
};

export const OrderStatusDisplayNamesInEnglish: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Confirmed]: 'Confirmed',
  [OrderStatus.Processing]: ' Processing',
  [OrderStatus.Shipped]: ' Shipped',
  [OrderStatus.Delivered]: ' Delivered',
  [OrderStatus.Cancelled]: 'Cancelled'
};

// Checkout specific interface
export interface CheckoutRequest extends AddOrderRequest {
  // This matches the AddOrderRequest structure
}