// AllProducts.tsx
import { useEffect, useState } from "react";
import { db } from "@/Database/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Product } from "../../types/types"; // Adjust the import based on your file structure

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
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
              <td className="py-2 px-4 border">${product.price.toFixed(2)}</td>
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
