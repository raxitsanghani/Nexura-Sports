import { db } from "@/Database/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Toggles the favorite status of a product for a user.
 * @param userId - The ID of the user.
 * @param productId - The ID of the product to toggle.
 */
export const handleToggleFavorite = async (
  userId: string,
  productId: string
) => {
  const userRef = doc(db, "users", userId); // Reference to the user's document

  try {
    const userDoc = await getDoc(userRef); // Fetch the user's document

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favorites: string[] = userData?.favorites || []; // Get the current favorites list

      if (favorites.includes(productId)) {
        // If the product is already in favorites, remove it
        await updateDoc(userRef, {
          favorites: favorites.filter((id) => id !== productId),
        });
      } else {
        // If the product is not in favorites, add it
        await updateDoc(userRef, {
          favorites: [...favorites, productId],
        });
      }
    } else {
      // Handle case where user document does not exist
      console.error("User document does not exist.");
    }
  } catch (error) {
    // Handle any errors during the update
    console.error("Error updating favorites: ", error);
  }
};
