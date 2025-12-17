import { db } from "@/Database/firebase";
import { doc, getDoc } from "firebase/firestore";
export const fetchCartItems = async (
  userId: string
): Promise<
  Record<string, { quantity: number; color?: string; size?: string }>
> => {
  const userRef = doc(db, "users", userId);
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Ensure `cart` is always an object
      const cart = userData?.cart ?? {};
      return Object.fromEntries(
        Object.entries(cart).filter(([key]) => key !== undefined) // Filter out invalid keys
      );
    } else {
      console.error("User document does not exist.");
      return {};
    }
  } catch (error) {
    console.error("Error fetching cart items: ", error);
    return {};
  }
};

// Calculate the total number of items in the cart
export const getTotalCartItems = async (userId: string): Promise<number> => {
  try {
    // Fetch the cart items for the user
    const cartItems = await fetchCartItems(userId);

    // Sum the quantities of all items
    const totalItems = Object.values(cartItems).reduce(
      (sum, item) => sum + (item.quantity || 0), // Ensure `quantity` is used and default to 0
      0 // Initial value of the sum
    );

    // Return the total number of items
    return totalItems;
  } catch (error) {
    // Log any errors that occur
    console.error("Error calculating total cart items: ", error);

    // Return 0 if there was an error
    return 0;
  }
};
