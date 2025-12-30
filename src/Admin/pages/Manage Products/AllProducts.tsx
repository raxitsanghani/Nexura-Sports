import { useEffect, useState } from "react";
import { db } from "@/Database/firebase";
import { updateDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Product } from "@/types";

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFixing, setIsFixing] = useState(false);

  const fetchProducts = async () => {
    const productsCollection = collection(db, "products");
    const snapshot = await getDocs(productsCollection);
    const productsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]; // Type assertion
    setProducts(productsList);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts(); // Refresh the product list
  };

  const fixCategories = async () => {
    if (!confirm("This will analyze all products. If a product name contains 'Woman' or 'Women', it will ensure the 'Woman' category is assigned. It will also fix category casing (e.g., 'women' -> 'Woman'). Continue?")) return;
    setIsFixing(true);
    try {
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      let count = 0;

      for (const d of snapshot.docs) {
        const data = d.data();
        let categories: string[] = Array.isArray(data.categories) ? data.categories : [];
        let updated = false;

        // 1. Parse name for gender
        const nameLower = (data.name || "").toLowerCase();
        // Check for common variations in potential existing categories to preserve them or normalize them
        const hasWoman = categories.some(c => c.toLowerCase().trim() === "woman" || c.toLowerCase().trim() === "women");

        // If name suggests woman and no woman category is present, add it
        if ((nameLower.includes("women") || nameLower.includes("woman") || nameLower.includes("ladies")) && !hasWoman) {
          categories.push("Woman");
          updated = true;
        }

        // 2. Normalize Casing and Trim
        const normalizedCategories = categories.map(c => {
          const trimmed = c.trim();
          if (trimmed.toLowerCase() === "women") return "Woman";
          if (trimmed.toLowerCase() === "woman") return "Woman";
          if (trimmed.toLowerCase() === "men") return "Man";
          if (trimmed.toLowerCase() === "man") return "Man";
          // Default capitalize first letter for others
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        });

        // Dedup
        const uniqueCategories = Array.from(new Set(normalizedCategories));

        // Check if changed
        if (updated || JSON.stringify(uniqueCategories) !== JSON.stringify(data.categories)) {
          await updateDoc(doc(db, "products", d.id), {
            categories: uniqueCategories
          });
          count++;
        }
      }
      alert(`Successfully updated categories for ${count} products.`);
      fetchProducts();
    } catch (error) {
      console.error("Error fixing categories:", error);
      alert("Failed to fix categories.");
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={fixCategories}
          disabled={isFixing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isFixing ? "Fixing..." : "Auto-Assign Categories"}
        </button>
      </div>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Product Name</th>
            <th className="py-2 px-4 border">Price</th>
            <th className="py-2 px-4 border">Default Image</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border">{product.name}</td>
              <td className="py-2 px-4 border">₹{Number(product.price).toFixed(2)}</td>
              <td className="py-2 px-4 border">
                <img
                  src={product.defaultImage || "default-image-url.jpg"}
                  alt={product.name}
                  className="w-16 h-16"
                />
              </td>
              <td className="py-2 px-4 border">
                <Link
                  to={`/admin/edit-product/${product.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 hover:underline ml-4"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllProducts;
