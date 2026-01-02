import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiTrash2, FiUserX, FiUserCheck } from "react-icons/fi";
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
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Profile Picture</th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">User Name</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Total Orders</th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">Email</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
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

  const profilePic = user.profilePic || user.photoURL || "https://placehold.co/100?text=User";
  const orderCount = user.orders?.length || user.totalOrders || 0; // Fallback to 0

  // Data Fetching for Expanded View
  useEffect(() => {
    if (isExpanded) {
      // Re-fetch orders every time detailed view opens to ensure latest data
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const db = getFirestore();
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.id)
          );

          const snapshot = await getDocs(q);
          const fetched = snapshot.docs.map(doc => {
            const data = doc.data();

            // Robust Date Parsing
            let dateStr = "Unknown";
            if (data.timestamp) {
              if (data.timestamp.seconds) {
                dateStr = new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });
              } else if (typeof data.timestamp.toDate === 'function') {
                dateStr = data.timestamp.toDate().toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });
              }
            } else if (data.date) {
              dateStr = data.date;
            }

            return {
              id: doc.id,
              orderId: data.orderId || doc.id,
              date: dateStr,
              rawTime: data.timestamp,
              products: data.products || [],
              price: Number(data.price) || Number(data.total) || 0,
              paymentMethod: data.paymentMethod || "Online",
              status: data.status
            };
          });

          // Sort manually by seconds
          fetched.sort((a, b) => {
            const timeA = a.rawTime?.seconds || 0;
            const timeB = b.rawTime?.seconds || 0;
            return timeB - timeA;
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

  // Derived count from actual fetched orders if available, else usage prop
  const displayOrderCount = userOrders.length > 0 ? userOrders.length : orderCount;

  return (
    <>
      <tr className="border-b border-[#eee] dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4/20 transition-colors">
        <td className="py-5 px-4 w-[120px]">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-stroke">
            <img src={profilePic} alt={user.name} className="h-full w-full object-cover" />
          </div>
        </td>
        <td className="py-5 px-4 font-medium text-black dark:text-white">
          {user.name}
        </td>
        <td className="py-5 px-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${displayOrderCount > 0 ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
            {displayOrderCount}
          </span>
        </td>
        <td className="py-5 px-4">
          <p className="text-black dark:text-white text-sm">{user.email}</p>
        </td>
        <td className="py-5 px-4 align-middle">
          <div className="flex items-center gap-3">
            {/* View Details Button - Only if orders exist or supposed to exist */}
            {(displayOrderCount > 0 || isExpanded) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 text-sm font-bold transition-colors"
              >
                {isExpanded ? "View Less" : "View Details"}
                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            )}

            {/* Block / Unblock */}
            <button
              onClick={() => onBlock(user.id, user.isBlocked || false)}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md font-medium transition shadow-sm ${user.isBlocked
                  ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
                }`}
            >
              {user.isBlocked ? <FiUserCheck size={16} /> : <FiUserX size={16} />}
              {user.isBlocked ? "Unblock" : "Block"}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(user.id)}
              className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Delete User Permanently"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={5} className="p-0 border-b border-[#eee] dark:border-strokedark bg-gray-50 dark:bg-meta-4/30 shadow-inner">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* User Snapshot */}
                    <div className="flex items-center gap-6 bg-white dark:bg-boxdark p-6 rounded-lg shadow border border-stroke">
                      <img src={profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700" />
                      <div>
                        <h4 className="font-bold text-black dark:text-white text-xl">{user.name}</h4>
                        <p className="text-gray-500 text-sm mb-1">{user.email}</p>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">ID: {user.id}</span>
                      </div>
                    </div>

                    {/* Stats Snapshot */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow border border-stroke flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Total Orders</span>
                        <span className="text-3xl font-extrabold text-indigo-600">{userOrders.length}</span>
                      </div>
                      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow border border-stroke flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Lifetime Value</span>
                        <span className="text-3xl font-extrabold text-green-600">₹{lifetimeValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white dark:bg-boxdark rounded-lg shadow border border-stroke overflow-hidden mb-2">
                    <div className="px-6 py-4 border-b border-stroke bg-gray-50 dark:bg-meta-4">
                      <h5 className="font-bold text-black dark:text-white text-base">Detailed Order History</h5>
                    </div>
                    {loadingOrders ? (
                      <div className="p-12 text-center text-gray-400 italic">
                        <span className="loading-spinner"></span> Loading order history...
                      </div>
                    ) : userOrders.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-stroke sticky top-0">
                            <tr>
                              <th className="p-4 w-[150px]">Order ID</th>
                              <th className="p-4 w-[120px]">Date</th>
                              <th className="p-4">Products</th>
                              <th className="p-4 w-[100px]">Method</th>
                              <th className="p-4 w-[120px] text-right">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {userOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-black dark:text-white">
                                  {order.orderId}
                                  <div className="text-xs text-green-600 font-normal mt-1">{order.status || 'Processing'}</div>
                                </td>
                                <td className="p-4 text-gray-600 font-medium">{order.date}</td>
                                <td className="p-4 text-gray-600">
                                  {order.products?.map((p: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                                      <span className="font-bold text-black dark:text-white">{p.quantity}x</span>
                                      <span className="truncate max-w-[200px]" title={p.product?.name}>{p.product?.name || "Product Item"}</span>
                                    </div>
                                  ))}
                                </td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded text-xs bg-gray-100 border border-gray-200 font-semibold uppercase tracking-wide">
                                    {order.paymentMethod}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-bold text-black dark:text-white">
                                  ₹{order.price.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
                        <span className="text-2xl">📦</span>
                        <p>No order history found for this user.</p>
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
