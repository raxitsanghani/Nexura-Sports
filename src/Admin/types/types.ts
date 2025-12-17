// types.ts

export interface Order {
  userId: string; // ID of the user who placed the order
  userName: string; // Name of the user
  orderId: string; // Unique order ID
  timestamp: number; // Timestamp of when the order was placed
  status: "Pre-order" | "In transit" | "Confirmed" | "Cancelled"; // Current status of the order
}

export interface TableThreeProps {
  orders: Order[]; // Array of orders to be displayed
  onCancel: (userId: string, orderId: string) => void; // Function to handle order cancellation
  onUpdateStatus: (userId: string, orderId: string, newStatus: string) => void; // Function to update order status
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
