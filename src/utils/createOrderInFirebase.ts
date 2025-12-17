import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { clearCartItems } from "./cartOperations";

// Initialize Firestore
const db = getFirestore();
// @ts-ignore
const createOrderInFirebase = async (userId, totalPrice, orderDetails) => {
  try {
    // Create a unique order ID
    const orderId = `#${Math.random().toString(36).substr(2, 9)}`;

    // Prepare the order data
    const orderData = {
      orderId,
      price: totalPrice,
      products: {}, // Initialize an empty object for products
      quantity: 0, // Initialize total quantity
      status: "Pre-order",
      timestamp: Timestamp.now(),
    };

    // Iterate over the order details and format them into the products field
    let totalQuantity = 0;
    for (const product of Object.values(orderDetails)) {
      // @ts-ignore
      const { productId, quantity } = product;
      // @ts-ignore
      orderData.products[productId] = quantity;
      totalQuantity += quantity;
    }

    // Update the total quantity in the orderData
    orderData.quantity = totalQuantity;

    // Reference to the user's document in Firestore
    const userDocRef = doc(db, "users", userId);

    // Update the user's orders field with the new order
    await updateDoc(userDocRef, {
      orders: arrayUnion(orderData),
    });

    console.log("Order created successfully!");
    clearCartItems(userId);
  } catch (error) {
    console.error("Error creating order: ", error);
  }
};

export const cancelOrder = async (
  userId: string,
  orderId: string
): Promise<void> => {
  try {
    // Reference to the user's document
    const userRef = doc(db, "users", userId);

    // Fetch the user's current orders
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const orders = userData?.orders || [];

      // Find the order to cancel
      // @ts-ignore
      const updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: "Cancelled" }; // Update status to "Cancelled"
        }
        return order;
      });

      // Update the user's document with the new orders array
      await updateDoc(userRef, { orders: updatedOrders });
      console.log("Order cancelled successfully.");
    } else {
      console.error("User document does not exist.");
    }
  } catch (error) {
    console.error("Error cancelling order: ", error);
  }
};

export const removeOrder = async (
  userId: string,
  orderId: string
): Promise<void> => {
  try {
    // Reference to the user's document
    const userRef = doc(db, "users", userId);

    // Fetch the user's current orders
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const orders = userData?.orders || [];

      // Filter out the order to be removed
      // @ts-ignore
      const updatedOrders = orders.filter((order) => order.orderId !== orderId);

      // Update the user's document with the new orders array
      await updateDoc(userRef, { orders: updatedOrders });
      console.log("Order removed successfully.");
    } else {
      console.error("User document does not exist.");
    }
  } catch (error) {
    console.error("Error removing order: ", error);
  }
};
export default createOrderInFirebase;
