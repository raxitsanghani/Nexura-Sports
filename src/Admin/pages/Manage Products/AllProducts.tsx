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
    if (!confirm("This will assign 'man', 'woman', 'sports' categories to all products that currently have NO categories. Continue?")) return;
    setIsFixing(true);
    try {
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      let count = 0;

      for (const d of snapshot.docs) {
        const data = d.data();
        if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
          await updateDoc(doc(db, "products", d.id), {
            categories: ["man", "woman", "sports"]
          });
          count++;
        }
      }
      alert(`Fixed categories for ${count} products.`);
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
              <td className="py-2 px-4 border">${Number(product.price).toFixed(2)}</td>
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
