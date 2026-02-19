import React, { useEffect, useState } from "react";
import { db } from "@/Database/firebase";
import CardDataStats from "../../components/CardDataStats";
import { collection, getDocs } from "firebase/firestore";
import { FiShoppingBag, FiUsers, FiDollarSign, FiClock } from "react-icons/fi";

const ECommerce: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders"))
        ]);

        setTotalUsers(usersSnap.size);
        setTotalProducts(productsSnap.size);

        let revenue = 0;
        let pending = 0;

        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          const price = Number(data.price) || Number(data.total) || 0;
          if (data.status !== "Cancelled") {
            revenue += price;
          }
          if (data.status === "Processing" || data.status === "Pre-order" || data.status === "Cancellation Requested") {
            pending++;
          }
        });

        setTotalRevenue(revenue);
        setPendingOrders(pending);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Business Overview</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Real-time performance metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <CardDataStats
          title="Total Products"
          total={loading ? "..." : totalProducts.toString()}
          levelUp={totalProducts > 0}
        >
          <FiShoppingBag className="w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="Active Users"
          total={loading ? "..." : totalUsers.toString()}
          levelUp={totalUsers > 0}
        >
          <FiUsers className="w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="Gross Revenue"
          total={loading ? "..." : `₹${totalRevenue.toLocaleString()}`}
          levelUp={totalRevenue > 0}
        >
          <FiDollarSign className="w-6 h-6" />
        </CardDataStats>

        <CardDataStats
          title="Pending Actions"
          total={loading ? "..." : pendingOrders.toString()}
          levelDown={pendingOrders > 5}
        >
          <FiClock className="w-6 h-6" />
        </CardDataStats>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[400px] rounded-[3rem] bg-white/50 border border-white border-dashed flex flex-col items-center justify-center text-slate-400 shadow-sm">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-sm font-black uppercase tracking-widest">Revenue Analytics coming soon</p>
          <p className="text-xs font-medium">Advanced visualization module in queue</p>
        </div>
        <div className="lg:col-span-4 h-[400px] rounded-[3rem] bg-white border border-slate-100 p-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 pb-4 border-b border-slate-50">System Integrity</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-700">Database Sync</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Latency: 12ms</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-700">Payment Gateway</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-700">Asset Server</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">High Load Observed</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Admin Security</p>
            <p className="text-xs font-bold text-slate-600">Session expires in 42m</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECommerce;
