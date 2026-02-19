import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiUserX, FiUserCheck } from "react-icons/fi";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
  photoURL?: string;
  orders?: any[];
  isBlocked?: boolean;
  totalOrders?: number;
}

interface UserTableProps {
  users: User[];
  onBlock: (userId: string, currentStatus: boolean) => void;
  onDelete: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onBlock, onDelete }) => {
  return (
    <div className="font-satoshi group overflow-hidden rounded-[2.5rem] border border-white bg-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
      <div className="max-w-full overflow-x-auto no-scrollbar">
        <table className="w-full table-auto border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100/60">
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Identity</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Verified</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Engagement</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Status</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onBlock={onBlock} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface UserRowProps {
  user: User;
  onBlock: (userId: string, currentStatus: boolean) => void;
  onDelete: (userId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onBlock, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [lifetimeValue, setLifetimeValue] = useState(0);

  const profilePic = user.profilePic || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=64748b&bold=true`;
  const orderCount = user.totalOrders || 0;

  useEffect(() => {
    if (isExpanded) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const db = getFirestore();
          const q = query(collection(db, "orders"), where("userId", "==", user.id));
          const snapshot = await getDocs(q);
          const fetched = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              orderId: data.orderId || doc.id,
              date: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleDateString('en-GB') : (data.date || 'Unknown'),
              price: Number(data.price) || Number(data.total) || 0,
              status: data.status,
              paymentMethod: data.paymentMethod || "Online"
            };
          });
          setUserOrders(fetched);
          setLifetimeValue(fetched.reduce((sum, order) => sum + order.price, 0));
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [isExpanded, user.id]);

  return (
    <>
      <tr className={`group/row border-b border-slate-50/50 transition-all duration-300 hover:bg-slate-50/30 ${isExpanded ? 'bg-slate-50/40' : ''}`}>
        <td className="py-7 px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white shadow-sm transition-transform duration-500 group-hover/row:scale-105">
              <img src={profilePic} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 tracking-tight">{user.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shopper Premium</span>
            </div>
          </div>
        </td>
        <td className="py-7 px-8">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-600">{user.email}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black text-green-600/70 uppercase">Verified</span>
            </div>
          </div>
        </td>
        <td className="py-7 px-8">
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-800 tracking-tighter">{orderCount}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</span>
          </div>
        </td>
        <td className="py-7 px-8">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border shadow-sm ${user.isBlocked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-rose-500 animate-pulse' : 'bg-green-500'}`}></div>
            {user.isBlocked ? 'Restricted' : 'Active'}
          </span>
        </td>
        <td className="py-7 px-8 text-right">
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className={`flex items-center justify-center h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {isExpanded ? 'Less' : 'Details'}
            </button>
            <button onClick={() => onBlock(user.id, user.isBlocked || false)} className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90 ${user.isBlocked ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`} title={user.isBlocked ? "Unblock" : "Block"}>
              {user.isBlocked ? <FiUserCheck size={18} /> : <FiUserX size={18} />}
            </button>
            <button onClick={() => onDelete(user.id)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 active:scale-90" title="Purge Data">
              <FiTrash2 size={18} />
            </button>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={5} className="p-0 border-b border-slate-100 bg-[#fdfdfe]">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                <div className="p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                    {/* User Stats Highlight */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Transactions</span>
                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{userOrders.length}</span>
                      </div>
                      <div className="bg-green-600 p-8 rounded-[2rem] shadow-xl shadow-green-100 flex flex-col justify-between h-40 text-white">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-200">Lifetime Contribution</span>
                        <span className="text-5xl font-black tracking-tighter">₹{lifetimeValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Security Context</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Account ID</span>
                            <span className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded-md">{user.id}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${user.isBlocked ? 'text-rose-400 bg-rose-400/10' : 'text-green-400 bg-green-400/10'}`}>
                              {user.isBlocked ? 'Restricted Access' : 'Full Access'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-800 rounded-full opacity-20"></div>
                    </div>
                  </div>

                  {/* Orders Log */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                      <h5 className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">Purchase History Log</h5>
                      <span className="text-[10px] font-bold text-slate-400 lowercase">{userOrders.length} records found</span>
                    </div>
                    {loadingOrders ? (
                      <div className="p-20 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      </div>
                    ) : userOrders.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50/50 sticky top-0 z-10">
                            <tr>
                              <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-wider">Reference</th>
                              <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-wider">Date</th>
                              <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-wider">Payload</th>
                              <th className="p-6 text-right text-[9px] font-black uppercase text-slate-400 tracking-wider">Gross Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {userOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6">
                                  <p className="text-[11px] font-mono font-black text-slate-800">{order.orderId}</p>
                                  <div className={`mt-1 text-[9px] font-black uppercase tracking-widest ${order.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}`}>{order.status}</div>
                                </td>
                                <td className="p-6 text-xs font-bold text-slate-500">{order.date}</td>
                                <td className="p-6">
                                  <div className="flex flex-wrap gap-1">
                                    {order.products?.slice(0, 2).map((p: any, i: number) => (
                                      <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-500 uppercase">{p.quantity}x {p.product?.name?.slice(0, 15)}...</span>
                                    ))}
                                    {order.products?.length > 2 && <span className="px-2 py-0.5 bg-slate-50 rounded-md text-[9px] font-black text-slate-400 uppercase">+{order.products.length - 2} more</span>}
                                  </div>
                                </td>
                                <td className="p-6 text-right font-black text-slate-800 text-sm">₹{order.price.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-20 text-center space-y-3">
                        <div className="text-4xl">📭</div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No transaction data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserTable;
