import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { FiAlertCircle } from "react-icons/fi";
import ReactLoading from "react-loading";
import toast, { Toaster } from 'react-hot-toast';

interface Order {
  orderId: string;
  // Support both legacy date object or Firestore Timestamp
  timestamp?: any;
  date?: string;
  time?: string;
  price: number;
  status: string;
  products: any[];
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        // Fallback for date display if timestamp exists
        if (data.timestamp && !data.date) {
          const d = data.timestamp.toDate();
          data.date = d.toLocaleDateString();
          data.time = d.toLocaleTimeString();
        }
        return data as Order;
      });

      // Sort by newest first (client-side to avoid index creation delay)
      fetchedOrders.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const openCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedOrderId(null);
  };

  const submitCancellation = async () => {
    if (!selectedOrderId || !cancelReason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    setSubmittingCancel(true);
    try {
      await updateDoc(doc(db, "orders", selectedOrderId), {
        status: "Cancellation Requested",
        cancellationReason: cancelReason
      });
      toast.success("Cancellation requested successfully.");
      closeCancelModal();
    } catch (error) {
      console.error("Error submitting cancellation:", error);
      toast.error("Failed to request cancellation.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return "bg-green-100 text-green-800";
      case 'In transit': return "bg-yellow-100 text-yellow-800";
      case 'Cancelled': return "bg-red-100 text-red-800";
      case 'Cancellation Requested': return "bg-orange-100 text-orange-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <Toaster />

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Request Cancellation</h3>
              <p className="text-sm text-gray-500 mb-4">Please tell us why you want to cancel your order.</p>

              <textarea
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none h-32"
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeCancelModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={submitCancellation}
                  disabled={submittingCancel || !cancelReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {submittingCancel ? 'Submitting...' : 'Request Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-lg font-semibold text-gray-600 flex justify-center py-20">
          <ReactLoading type={"bars"} height={30} width={30} color="black" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 mb-4">No orders found.</p>
        </div>
      ) : (
        <section className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">My Orders</h2>
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="relative flex flex-wrap items-center gap-y-4 py-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase">Order ID</h3>
                    <p className="mt-1 text-base font-bold text-gray-900">{order.orderId}</p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase">Date</h3>
                    <p className="mt-1 text-base font-medium text-gray-900">{order.date}</p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase">Total</h3>
                    <p className="mt-1 text-base font-medium text-gray-900">₹ {Number(order.price).toFixed(2)}</p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase">Status</h3>
                    <div className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full flex justify-end mt-2">
                    {order.status !== "Cancelled" && order.status !== "Cancellation Requested" && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(order.orderId)}
                        className="rounded bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 hover:text-red-600 transition-colors uppercase tracking-wider"
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.status === "Cancellation Requested" && (
                      <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                        <FiAlertCircle /> Cancellation Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default OrdersList;
