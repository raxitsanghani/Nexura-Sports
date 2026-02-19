import React, { useState, useEffect } from "react";
import { CgSandClock } from "react-icons/cg";
import { FiTruck, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { TableThreeProps, Order, OrderProduct } from "../../types/types";

const TableThree: React.FC<TableThreeProps> = ({
  orders,
  onCancel,
  onUpdateStatus,
  onHandleCancellation
}) => {
  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="font-satoshi group overflow-hidden rounded-[2.5rem] border border-white bg-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
      <div className="max-w-full overflow-x-auto no-scrollbar">
        <table className="w-full table-auto border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100/60">
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order & Value</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Tracked</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Phase</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {safeOrders.map((order: Order) => (
              <OrderRow
                key={order.orderId}
                order={order}
                onCancel={onCancel}
                onUpdateStatus={onUpdateStatus}
                onHandleCancellation={onHandleCancellation}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface OrderRowProps {
  order: Order;
  onCancel: (userId: string, orderId: string) => void;
  onUpdateStatus: (userId: string, orderId: string, newStatus: string) => void;
  onHandleCancellation?: (orderId: string, action: 'accept' | 'reject') => void;
}

const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onCancel,
  onUpdateStatus,
  onHandleCancellation
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pre-order":
      case "Processing":
        return {
          color: "bg-amber-100 text-amber-700 border-amber-200/50",
          icon: <CgSandClock className="w-3.5 h-3.5" />,
          label: "Pending"
        };
      case "In transit":
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200/50",
          icon: <FiTruck className="w-3.5 h-3.5" />,
          label: "Moving"
        };
      case "Confirmed":
        return {
          color: "bg-green-100 text-green-700 border-green-200/50",
          icon: <IoCheckmarkSharp className="w-3.5 h-3.5" />,
          label: "Success"
        };
      case "Cancelled":
        return {
          color: "bg-rose-100 text-rose-700 border-rose-200/50",
          icon: <RxCross2 className="w-3.5 h-3.5" />,
          label: "Failed"
        };
      case "Cancellation Requested":
        return {
          color: "bg-orange-100 text-orange-700 border-orange-200/50",
          icon: <FiAlertCircle className="w-3.5 h-3.5" />,
          label: "Warning"
        };
      default:
        return { color: "bg-slate-100 text-slate-700", icon: null, label: status };
    }
  };

  useEffect(() => {
    if (isExpanded && !userData && order.userId) {
      const fetchUser = async () => {
        setLoadingUser(true);
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", order.userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as Record<string, unknown>);
          }
        } catch (error) {
          console.error("Failed to fetch user details", error);
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUser();
    }
  }, [isExpanded, order.userId, userData]);

  const products = order.products || [];
  const shippingCost = order.shipping === 'express' ? 250 : 0;
  let totalOriginalSubtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const calculatedProducts = products.map((item: OrderProduct) => {
    const originalPrice = Number(item.product?.price || 0);
    const qty = Number(item.quantity || 1);
    const lineTotalOriginal = originalPrice * qty;
    let discountPercent = 0;
    let discountAmount = 0;

    if (item.product?.discount) {
      const discountString = String(item.product.discount).replace(/[^0-9.]/g, '');
      discountPercent = Number(discountString);
      if (!isNaN(discountPercent) && discountPercent > 0) {
        discountAmount = (lineTotalOriginal * (discountPercent / 100));
      }
    }

    const lineTotalAfterDiscount = lineTotalOriginal - discountAmount;
    const discountedUnitPrice = originalPrice - (discountAmount / qty);
    const taxRate = discountedUnitPrice > 2500 ? 0.18 : 0.05;
    const itemTax = (lineTotalAfterDiscount) * taxRate;

    totalOriginalSubtotal += lineTotalOriginal;
    totalDiscount += discountAmount;
    totalTax += itemTax;

    return { ...item, originalPrice, qty, discountPercent, discountAmount, lineTotalOriginal, lineTotalAfterDiscount, discountedUnitPrice };
  });

  const grandTotal = totalOriginalSubtotal - totalDiscount + totalTax + shippingCost;
  const statusConfig = getStatusConfig(order.status);
  const userPhoto = (userData?.photoURL as string) || (userData?.photoUrl as string) || "https://placehold.co/100?text=User";
  const userDisplayName = (userData?.displayName as string) || (userData?.name as string) || order.userName;
  const userEmail = (userData?.email as string) || "No email available";

  return (
    <>
      <tr className={`group/row border-b border-slate-50/50 transition-all duration-300 hover:bg-slate-50/30 ${isExpanded ? 'bg-slate-50/40' : ''}`}>
        <td className="py-7 px-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-black text-slate-400 font-mono tracking-tighter uppercase mb-1">ID: {order.orderId.slice(0, 12)}...</span>
            <span className="text-xl font-black text-slate-800 tracking-tight">₹{(Number(order.price) || 0).toLocaleString()}</span>
          </div>
        </td>
        <td className="py-7 px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
              {(order.userName || "U").charAt(0)}
            </div>
            <span className="text-sm font-bold text-slate-700">{order.userName}</span>
          </div>
        </td>
        <td className="py-7 px-8">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-600">{String(order.timestamp).split(' ').slice(1, 4).join(' ')}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{String(order.timestamp).split(' ')[0]}</span>
          </div>
        </td>
        <td className="py-7 px-8">
          <div className="flex flex-col gap-2">
            <span className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm ${statusConfig.color}`}>
              {statusConfig.icon}
              {order.status}
            </span>
            {order.status === "Cancellation Requested" && order.cancellationReason && (
              <span className="max-w-[150px] truncate text-[10px] font-semibold text-orange-600 italic">
                "{order.cancellationReason}"
              </span>
            )}
          </div>
        </td>
        <td className="py-7 px-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              {order.status === "Cancellation Requested" ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => onHandleCancellation?.(order.orderId, 'accept')} className="bg-green-600 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-95 text-[11px] font-black uppercase tracking-wider">Accept</button>
                  <button onClick={() => onHandleCancellation?.(order.orderId, 'reject')} className="bg-rose-500 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-rose-100 hover:shadow-rose-200 transition-all active:scale-95 text-[11px] font-black uppercase tracking-wider">Reject</button>
                </div>
              ) : order.status === "Cancelled" ? (
                <button onClick={() => onCancel(order.userId, order.orderId)} className="bg-rose-500 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-rose-100 hover:shadow-rose-200 transition-all active:scale-95 text-[11px] font-black uppercase tracking-wider">Delete</button>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={statusUpdate || order.status}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_0.8rem_center] bg-no-repeat"
                  >
                    <option value="Processing">Processing</option>
                    <option value="In transit">Moving</option>
                    <option value="Confirmed">Success</option>
                    <option value="Cancelled">Failed</option>
                  </select>
                  <button onClick={() => { if (statusUpdate) { onUpdateStatus(order.userId, order.orderId, statusUpdate); setStatusUpdate(undefined); } }} className="bg-green-600 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-95 text-[11px] font-black uppercase tracking-wider disabled:opacity-50" disabled={!statusUpdate}>Save</button>
                </div>
              )}
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
              <FiChevronDown />
            </button>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={5} className="p-0 border-b border-slate-100 bg-[#fdfdfe]">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">

                  {/* Products Section */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                      <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                      <h4 className="text-lg font-black tracking-tight text-slate-800 uppercase tracking-[0.1em]">Ordered Contents</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {calculatedProducts.map((item: any, idx: number) => {
                        const imgUrl = item.product?.imageUrls?.[0] || item.product?.defaultImage || 'https://placehold.co/100';
                        return (
                          <div key={idx} className="group/item flex gap-5 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1">
                            <div className="relative w-28 h-28 bg-slate-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                              <img src={imgUrl} alt={item.product?.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                              {item.discountPercent > 0 && (
                                <span className="absolute top-0 left-0 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-br-xl">-{item.discountPercent}%</span>
                              )}
                            </div>
                            <div className="flex flex-col justify-between py-1 overflow-hidden">
                              <div className="space-y-1">
                                <h5 className="font-black text-slate-800 line-clamp-1 leading-tight">{item.product?.name || "Premium Item"}</h5>
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">Size {item.size}</span>
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">Qty {item.quantity}</span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Value</span>
                                <span className="text-xl font-black text-green-600 tracking-tight">₹{item.discountedUnitPrice?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar Info Section */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Financial Summary */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-800 pb-4">Financial Overview</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Net Value</span>
                          <span className="font-bold tracking-tight">₹{totalOriginalSubtotal.toLocaleString()}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-rose-400">RebateApplied</span>
                            <span className="font-bold tracking-tight text-rose-400">-₹{totalDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Compliance Tax</span>
                          <span className="font-bold tracking-tight text-slate-200">₹{totalTax.toLocaleString()}</span>
                        </div>
                        <div className="pt-6 mt-4 border-t border-slate-800 flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Gross Payable</span>
                            <span className="text-3xl font-black tracking-tighter text-green-400">₹{grandTotal.toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-400 px-3 py-1 rounded-full mb-1">Cleared</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Credential Details</h4>
                      {loadingUser ? (
                        <div className="animate-pulse space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                            <div className="h-4 bg-slate-100 w-24 rounded"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-slate-50 shadow-sm">
                              <img src={userPhoto} className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-black text-slate-800 text-lg leading-tight truncate">{userDisplayName}</p>
                              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                            </div>
                          </div>
                          <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 mb-1">Destination</p>
                              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                {order.address?.city}, {order.address?.state}<br />
                                PIN: {order.address?.pincode || order.address?.zipcode}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors hover:bg-green-50">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">📞</div>
                              <span className="text-sm font-black text-slate-700">{order.address?.mobile || "No contact"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

export default TableThree;
