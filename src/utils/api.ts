// src/utils/api.ts
import { db } from "@/Database/firebase"; // Ensure this path is correct
import { doc, getDoc } from "firebase/firestore";

export const fetchProductData = async (productId: string) => {
  if (!productId) {
    console.error("Invalid product ID");
    return null;
  }

  try {
    const productRef = doc(db, "products", productId); // Use the correct Firestore instance
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching product data: ", error);
    return null;
  }
};
