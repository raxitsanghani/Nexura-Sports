import { db } from "@/Database/firebase"; // Ensure this import is correct
import { doc, getDoc } from "firebase/firestore";

// Function to fetch the user's favorite products from Firestore
export const fetchUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Assuming 'favorites' is an array of product IDs
      return userData?.favorites || [];
    } else {
      console.error("User document does not exist.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user favorites: ", error);
    return [];
  }
};
