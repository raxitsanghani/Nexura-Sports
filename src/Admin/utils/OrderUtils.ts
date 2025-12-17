import { db } from "@/Database/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getFirestore,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export const fetchAllOrders = async () => {
  const db = getFirestore();
  const ordersCollection = collection(db, "users");
  const snapshot = await getDocs(ordersCollection);
  const orders = [];

  snapshot.forEach((doc) => {
    const userOrders = doc.data().orders || [];
    userOrders.forEach((order) => {
      const formattedOrder = {
        ...order,
        userId: doc.id,
        userName: doc.data().name,
        invoiceDate: new Date(
          order.timestamp.seconds * 1000
        ).toLocaleDateString(),
      };
      orders.push(formattedOrder);
    });
  });

  return orders;
};
export const deleteOrder = async (userId, orderId) => {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDocs(collection(userRef, "orders"));

  // Check if user orders are fetched
  if (!userSnapshot.empty) {
    // Find the order document
    const orderDoc = userSnapshot.docs.find(
      (doc) => doc.data().orderId === orderId
    );

    if (orderDoc) {
      // Delete the order document
      await deleteDoc(orderDoc.ref);
      console.log("Order deleted successfully!");
    } else {
      console.error("Order not found for deletion. Order ID:", orderId);
    }
  } else {
    console.error("No orders found for user:", userId);
  }
};

export const updateOrderStatus = async (userId, orderId, newStatus) => {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    console.error(`User not found: ${userId}`);
    return;
  }

  const userData = userSnapshot.data();
  const orders = userData.orders || [];
  console.log("Fetched user orders:", orders);

  // Find the order by ID
  const orderIndex = orders.findIndex((order) => order.orderId === orderId);

  if (orderIndex !== -1) {
    try {
      // Update the status of the specific order
      orders[orderIndex].status = newStatus; // Update the order in the array

      await updateDoc(userRef, { orders }); // Update the user document
      console.log("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  } else {
    console.error(
      `Order not found for status update. Order ID: ${orderId} User ID: ${userId}`
    );
  }
};
