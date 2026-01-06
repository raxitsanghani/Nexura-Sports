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
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 font-semibold text-sm"
        >
          {isFixing ? "Fixing..." : "Auto-Assign Categories"}
        </button>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-meta-4/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Product Name</th>
                <th className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Price</th>
                <th className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Default Image</th>
                <th className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-meta-4/20 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{product.name}</td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-300">₹{Number(product.price).toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={product.defaultImage || "default-image-url.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/edit-product/${product.id}`}
                        className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-block bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
