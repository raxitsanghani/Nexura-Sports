import React, { useState, useEffect } from "react";
import { CgSandClock } from "react-icons/cg";
import { FiTruck, FiAlertCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
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
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Order Info</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Customer</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Date</th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
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
  // Using Record<string, unknown> to avoid 'any' lint error for unstructured firestore data
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pre-order":
      case "Processing": return <CgSandClock className="text-yellow-500" />;
      case "In transit": return <FiTruck className="text-blue-500" />;
      case "Confirmed": return <IoCheckmarkSharp className="text-green-500" />;
      case "Cancelled": return <RxCross2 className="text-red-500" />;
      case "Cancellation Requested": return <FiAlertCircle className="text-orange-500" />;
      default: return null;
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

  // Recalculate Logic to match Checkout.tsx
  const products = order.products || [];
  const shippingCost = order.shipping === 'express' ? 250 : 0; // Or standard free

  let totalOriginalSubtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  // Enhance products with calculated fields for display
  const calculatedProducts = products.map((item: OrderProduct) => {
    const originalPrice = Number(item.product?.price || 0);
    const qty = Number(item.quantity || 1);
    const lineTotalOriginal = originalPrice * qty;

    let discountPercent = 0;
    let discountAmount = 0;

    // Parse discount similarly to Checkout.tsx
    if (item.product?.discount) {
      const discountString = String(item.product.discount).replace(/[^0-9.]/g, '');
      discountPercent = Number(discountString);
      if (!isNaN(discountPercent) && discountPercent > 0) {
        discountAmount = (lineTotalOriginal * (discountPercent / 100));
      }
    }

    const lineTotalAfterDiscount = lineTotalOriginal - discountAmount;

    // GST Logic: Calculated on the discounted price
    // GST Slabs: Below 2500 -> 5%, Above 2500 -> 18%
    const discountedUnitPrice = originalPrice - (discountAmount / qty);
    const taxRate = discountedUnitPrice > 2500 ? 0.18 : 0.05;
    const itemTax = (lineTotalAfterDiscount) * taxRate;

    totalOriginalSubtotal += lineTotalOriginal;
    totalDiscount += discountAmount;
    totalTax += itemTax;

    return {
      ...item,
      originalPrice,
      qty,
      discountPercent,
      discountAmount,
      lineTotalOriginal,
      lineTotalAfterDiscount,
      discountedUnitPrice
    };
  });

  // Safe Grand Total Calculation
  const grandTotal = totalOriginalSubtotal - totalDiscount + totalTax + shippingCost;

  // Cast userData props safely for display
  const userPhoto = (userData?.photoURL as string) || "https://placehold.co/100?text=User";
  const userDisplayName = (userData?.displayName as string) || (userData?.name as string) || order.userName;
  const userEmail = (userData?.email as string) || "No email provided";

  return (
    <>
      <tr className="border-b border-[#eee] dark:border-strokedark transition-colors hover:bg-gray-50 dark:hover:bg-meta-4/20">
        <td className="py-5 px-4 align-top">
          <p className="text-black font-medium dark:text-white">{order.orderId}</p>
          <p className="text-sm text-gray-500">₹{order.price}</p>
        </td>
        <td className="py-5 px-4 align-top">
          <p className="text-black dark:text-white">{order.userName}</p>
        </td>
        <td className="py-5 px-4 align-top">
          <p className="text-sm">{order.timestamp}</p>
        </td>
        <td className="py-5 px-4 align-top">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="font-medium text-sm">{order.status}</span>
            </span>
            {order.status === "Cancellation Requested" && order.cancellationReason && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 italic">
                "{order.cancellationReason}"
              </span>
            )}
          </div>
        </td>
        <td className="py-5 px-4 align-top">
          <div className="flex flex-col space-y-2 items-start">
            {order.status === "Cancellation Requested" ? (
              <div className="flex items-center space-x-2">
                <button onClick={() => onHandleCancellation?.(order.orderId, 'accept')} className="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600 text-xs font-medium transition">Accept</button>
                <button onClick={() => onHandleCancellation?.(order.orderId, 'reject')} className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600 text-xs font-medium transition">Reject</button>
              </div>
            ) : order.status === "Cancelled" ? (
              <button onClick={() => onCancel(order.userId, order.orderId)} className="bg-red-500 text-white rounded px-3 py-1 text-xs hover:bg-red-600 transition">Delete</button>
            ) : (
              <div className="flex flex-col gap-2 w-full max-w-[140px]">
                <div className="flex gap-2">
                  <select value={statusUpdate || order.status} onChange={(e) => setStatusUpdate(e.target.value)} className="w-full border rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-meta-4">
                    <option value="Processing">Processing</option>
                    <option value="In transit">In transit</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => { if (statusUpdate) { onUpdateStatus(order.userId, order.orderId, statusUpdate); setStatusUpdate(undefined); } }} className="bg-blue-600 text-white rounded px-2 py-1 text-xs hover:bg-blue-700 transition">Save</button>
                </div>
                <button onClick={() => onCancel(order.userId, order.orderId)} className="text-red-500 text-xs hover:text-red-700 transition text-left">Delete Order</button>
              </div>
            )}
            <button onClick={() => setIsExpanded(!isExpanded)} className="group flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors mt-2">
              {isExpanded ? <>View Less Details <FiChevronUp /></> : <>View More Details <FiChevronDown /></>}
            </button>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={5} className="p-0 border-b border-[#eee] dark:border-strokedark bg-gray-50 dark:bg-meta-4/30">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 text-black dark:text-white">

                  {/* Column 1: Products */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-bold text-lg border-b pb-2 mb-4">Ordered Products</h4>
                    <div className="space-y-4">
                      {calculatedProducts.length > 0 ? calculatedProducts.map((item: OrderProduct, idx: number) => {
                        const imgUrl = item.product?.imageUrls?.[0] || item.product?.image?.url || item.product?.defaultImage || 'https://placehold.co/100';
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-boxdark p-4 rounded shadow-sm border border-stroke dark:border-strokedark relative overflow-hidden">
                            {/* Discount Badge */}
                            {item.discountPercent !== undefined && item.discountPercent > 0 && (
                              <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-br z-10">
                                {item.discountPercent}% OFF
                              </div>
                            )}

                            <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                              <img src={imgUrl} alt={item.product?.name || "Product"} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>

                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="sm:col-span-1">
                                <p className="font-bold text-black dark:text-white line-clamp-2 text-base">{item.product?.name || "Unknown Product"}</p>
                                <p className="text-gray-500 text-xs mt-1">ID: {item.productId}</p>
                              </div>

                              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                                <p><span className="font-semibold text-black dark:text-white">Size:</span> {item.size}</p>
                                <p><span className="font-semibold text-black dark:text-white">Qty:</span> {item.quantity}</p>

                                {/* Pricing per Unit Display */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.discountAmount !== undefined && item.discountAmount > 0 ? (
                                    <>
                                      <span className="line-through text-gray-400 text-xs">₹{item.originalPrice}</span>
                                      <span className="font-bold text-black dark:text-white">₹{item.discountedUnitPrice?.toFixed(2)}</span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-black dark:text-white">₹{item.originalPrice}</span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                                <p className="font-semibold text-gray-500 text-xs uppercase">Subtotal</p>
                                <p className="text-green-600 font-bold text-lg">₹{item.lineTotalAfterDiscount?.toFixed(2)}</p>
                                {item.discountAmount !== undefined && item.discountAmount > 0 && (
                                  <p className="text-xs text-red-500">Saved: ₹{item.discountAmount.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }) : <p className="text-gray-500">No product details available.</p>}
                    </div>
                  </div>

                  {/* Column 2: Order Summary & User Info */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-boxdark p-5 rounded shadow-sm border border-stroke dark:border-strokedark text-sm">
                      <h4 className="font-bold text-lg mb-4 text-black dark:text-white border-b pb-2">Payment Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Subtotal</span>
                          <span className="font-medium">₹{totalOriginalSubtotal.toFixed(2)}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>Total Discount</span>
                            <span className="font-medium">- ₹{totalDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Tax (GST)</span>
                          <span className="font-medium">₹{totalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Shipping Charges</span>
                          <span className="font-medium">{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
                        </div>

                        <div className="border-t border-stroke dark:border-strokedark pt-3 mt-2 flex justify-between items-center">
                          <span className="font-bold text-lg text-black dark:text-white">Grand Total</span>
                          <span className="font-bold text-xl text-green-600">₹{grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-boxdark p-5 rounded shadow-sm border border-stroke dark:border-strokedark text-sm">
                      <h4 className="font-bold text-lg mb-4 text-black dark:text-white border-b pb-2">Shipping Address</h4>
                      {order.address ? (
                        <div className="text-gray-600 dark:text-gray-300 space-y-2">
                          <p className="font-bold text-black dark:text-white text-base">{order.address.name}</p>
                          <p>{order.address.city}, {order.address.state}</p>
                          <p>{order.address.pincode || order.address.zipcode}</p>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed">
                            <span className="text-lg">📞</span>
                            <span className="font-medium">{order.address.mobile || order.address.phone || "N/A"}</span>
                          </div>
                        </div>
                      ) : <p className="text-gray-500 italic">No address details available.</p>}
                    </div>

                    <div className="bg-white dark:bg-boxdark p-5 rounded shadow-sm border border-stroke dark:border-strokedark w-full">
                      <h4 className="font-bold text-lg mb-4 text-black dark:text-white border-b pb-2">Customer Details</h4>
                      {loadingUser ? (
                        <div className="animate-pulse flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                          <div className="h-4 bg-slate-200 w-32 rounded"></div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100">
                            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-sm overflow-hidden flex-1">
                            <p className="font-bold text-black dark:text-white truncate text-base">{userDisplayName}</p>
                            <p className="text-gray-500 text-xs truncate">{userEmail}</p>
                          </div>
                        </div>
                      )}
                      {!loadingUser && !userData && <p className="text-xs text-gray-400 mt-2">User profile not found.</p>}
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
