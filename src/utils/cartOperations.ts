import { db } from "@/Database/firebase";
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const userRef = doc(db, "users", userId);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error("User document does not exist");
      return;
    }
    const cart = userDoc.data()?.cart || {};
    const item = cart[productId] || {};
    await updateDoc(userRef, {
      [`cart.${productId}`]: {
        ...item, // Preserve existing attributes
        quantity,
      },
    });
    console.log(`Updated cart item ${productId} to quantity ${quantity}`);
  } catch (error) {
    console.error("Error updating cart item: ", error);
  }
};

export const removeCartItem = async (userId: string, productId: string) => {
  const userRef = doc(db, "users", userId);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error("User document does not exist");
      return;
    }
    await updateDoc(userRef, {
      [`cart.${productId}`]: deleteField(),
    });
    console.log(`Removed cart item ${productId}`);
  } catch (error) {
    console.error("Error removing cart item: ", error);
  }
};

export const clearCartItems = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  try {
    await setDoc(userRef, { cart: {} }, { merge: true });
    console.log("Cleared all cart items");
  } catch (error) {
    console.error("Error clearing cart items: ", error);
  }
};
