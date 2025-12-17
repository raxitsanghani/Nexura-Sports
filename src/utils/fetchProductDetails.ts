import { db } from "@/Database/firebase";
import { doc, getDocs, query, where } from "firebase/firestore";

export interface Product {
  name: string;
  price: number;
  description: string;
  // Add other fields based on your Firestore schema
}

export const fetchProductsByIds = async (
  productIds: string[]
): Promise<Record<string, Product>> => {
  if (productIds.length === 0) {
    return {}; // No IDs provided
  }

  // Create a query to fetch products with the given IDs
  const productsRef = db.collection("products");
  const q = query(productsRef, where("__name__", "in", productIds));

  try {
    const querySnapshot = await getDocs(q);
    const products: Record<string, Product> = {};

    querySnapshot.forEach((doc) => {
      products[doc.id] = doc.data() as Product;
    });

    return products;
  } catch (error) {
    console.error("Error fetching products: ", error);
    return {};
  }
};
