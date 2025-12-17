import { doc, getDoc } from "firebase/firestore";
import { db } from "@/Database/firebase"; // Adjust the import as needed

interface Order {
  orderId: string;
  price: number;
  products: Record<string, number>;
  quantity: number;
  status: string;
  date: string; // Date as a formatted string
  time: string; // Time as a formatted string
}

export const fetchOrders = async (userId: string): Promise<Order[]> => {
  const userRef = doc(db, "users", userId);
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const orders = userData?.orders || [];

      // Convert Firestore timestamps to strings and handle nested maps
      return orders.map((order: any) => {
        const timestamp = order.timestamp?.toDate() || new Date();
        const date = timestamp.toLocaleDateString(); // Date in 'MM/DD/YYYY' format
        const time = timestamp.toLocaleTimeString(); // Time in 'HH:MM:SS AM/PM' format

        return {
          ...order,
          date,
          time,
        };
      });
    } else {
      console.error("User document does not exist.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return [];
  }
};
