import { useEffect, useState } from "react";
import { db } from "@/Database/firebase";
import { updateDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const AllProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isFixing, setIsFixing] = useState(false);

  const fetchProducts = async () => {
    const productsCollection = collection(db, "products");
    const snapshot = await getDocs(productsCollection);
    const productsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    setProducts(productsList);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
      toast({
        variant: "success",
        title: "Asset Purged",
        description: "Product record successfully removed from registry.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purge Failed",
        description: "Encountered an error while deleting the asset.",
      });
    }
  };

  const fixCategories = async () => {
    if (!confirm("Auto-assign gender categories based on product names?")) return;
    setIsFixing(true);
    try {
      const productsCollection = collection(db, "products");
      const snapshot = await getDocs(productsCollection);
      let count = 0;
      for (const d of snapshot.docs) {
        const data = d.data();
        let categories: string[] = Array.isArray(data.categories) ? data.categories : [];
        const nameLower = (data.name || "").toLowerCase();
        const hasWoman = categories.some(c => c.toLowerCase().trim() === "woman" || c.toLowerCase().trim() === "women");
        if ((nameLower.includes("women") || nameLower.includes("woman") || nameLower.includes("ladies")) && !hasWoman) {
          categories.push("Woman");
          const normalized = Array.from(new Set(categories.map(c => {
            const t = c.trim().toLowerCase();
            if (t === "women" || t === "woman") return "Woman";
            if (t === "men" || t === "man") return "Man";
            return c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase();
          })));
          await updateDoc(doc(db, "products", d.id), { categories: normalized });
          count++;
        }
      }
      toast({
        variant: "success",
        title: "Categorization Complete",
        description: `Successfully analyzed and updated ${count} assets.`,
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.categories?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-12 font-satoshi">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-black tracking-tighter text-slate-800">Inventory Assets</h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Global Product Management</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-none md:w-64 group">
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all placeholder:text-slate-300"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
          </div>
          <button
            onClick={fixCategories}
            disabled={isFixing}
            className="flex-1 md:flex-none bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {isFixing ? "Processing..." : "Auto-Categorize"}
          </button>
          <Link
            to="/admin/add-product"
            className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 transition-all text-center"
          >
            Deploy
          </Link>
        </div>
      </div>

      <div className="group overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Product Line</th>
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Market Value</th>
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Visual Identity</th>
                <th className="py-6 px-10 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Asset Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                  <td className="py-6 px-10">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 tracking-tight line-clamp-1">{product.name}</span>
                      <div className="flex gap-2 mt-1.5">
                        {product.categories?.slice(0, 2).map((cat, i) => (
                          <span key={i} className="text-[9px] font-black uppercase bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">{cat}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-10">
                    <span className="text-lg font-black text-slate-800 tracking-tighter italic">₹{Number(product.price).toLocaleString()}</span>
                  </td>
                  <td className="py-6 px-10">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-white shadow-sm transition-all duration-500 group-hover/row:scale-110 group-hover/row:shadow-xl group-hover/row:shadow-slate-100">
                      <img
                        src={product.defaultImage || "https://placehold.co/100"}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 mix-blend-multiply bg-slate-50"
                      />
                    </div>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <Link
                        to={`/admin/edit-product/${product.id}`}
                        className="h-10 px-6 flex items-center bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all"
                      >
                        Modify
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                      >
                        🗑️
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
