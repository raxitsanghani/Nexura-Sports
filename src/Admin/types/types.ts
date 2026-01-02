// types.ts

export interface OrderProduct {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  price?: number; // stored price at time of order
  product?: Product & { discount?: string | number, imageUrls?: string[], image?: { url: string } }; // partial product data
  // Calculated fields for UI
  originalPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  lineTotalAfterDiscount?: number;
  discountedUnitPrice?: number;
  lineTotalOriginal?: number;
}

export interface Order {
  userId: string; // ID of the user who placed the order
  userName: string; // Name of the user
  orderId: string; // Unique order ID
  timestamp: string | number; // Timestamp of when the order was placed (relaxed type)
  status: string; // Relaxed status type to match DB strings like "Cancellation Requested"
  cancellationReason?: string;
  price?: number | string;
  products?: OrderProduct[];
  shipping?: string;
  address?: any;
  extraDetails?: any;
}

export interface TableThreeProps {
  orders: Order[]; // Array of orders to be displayed
  onCancel: (userId: string, orderId: string) => void; // Function to handle order cancellation
  onUpdateStatus: (userId: string, orderId: string, newStatus: string) => void; // Function to update order status
  onHandleCancellation?: (orderId: string, action: 'accept' | 'reject') => void;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  defaultImage?: string; // Optional, if a product might not have a default image
}

export interface TableTwoProps {
  products: Product[];
  onDelete: (id: string) => void;
}
export interface AllProductsProps {
  products: Product[];
  onDelete: (id: string) => Promise<void>; // Callback for deleting a product
}
