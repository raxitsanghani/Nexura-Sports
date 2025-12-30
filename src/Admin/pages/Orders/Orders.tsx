import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import TableThree from "@/Admin/components/Tables/TableThree";
import ReactLoading from "react-loading";
import toast, { Toaster } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, "orders")); // Client-side sort if needed or use orderBy("timestamp", "desc") if index exists

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          // Normalize data for TableThree
          key: doc.id,
          orderId: data.orderId || doc.id,
          userName: data.address?.name || "Unknown",
          // Timestamp handling
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toDateString() : (data.date || new Date().toDateString()),
          rawTimestamp: data.timestamp
        };
      });

      // Sort Newest First (Client-side fallback)
      fetchedOrders.sort((a: any, b: any) => {
        const timeA = a.rawTimestamp?.seconds || 0;
        const timeB = b.rawTimestamp?.seconds || 0;
        return timeB - timeA;
      });

      setOrders(fetchedOrders as any);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast.error("Failed to sync orders.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (userId: string, orderId: string) => {
    // Note: orderId in TableThree is passed, but we essentially need the doc ID.
    // In our new schema, orderId IS the doc ID (e.g., #AB123).
    // The previous TableThree implementation passed (userId, orderId). 
    // We will assume orderId is the Doc ID.
    try {
      await deleteDoc(doc(db, "orders", orderId));
      toast.success("Order deleted permanently");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const handleUpdateStatus = async (userId: string, orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleCancellationRequest = async (orderId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await updateDoc(doc(db, "orders", orderId), { status: "Cancelled" });
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-green-500/90 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    Cancellation Accepted
                  </p>
                  <p className="mt-1 text-sm opacity-90">
                    Order has been cancelled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 2000 });
      } else {
        // Reject: Revert to Processing (or maybe keep it requesting but mark rejected? 
        // Prompt says "Order remains active". Status 'Processing' implies active.
        await updateDoc(doc(db, "orders", orderId), {
          status: "Processing",
          cancellationReason: null // Optional: clear reason
        });
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-500/90 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    Cancellation Rejected
                  </p>
                  <p className="mt-1 text-sm opacity-90">
                    Order remains active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 2000 });
      }
    } catch (error) {
      console.error("Error handling cancellation request:", error);
      toast.error("Action failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ReactLoading type={"bars"} height={40} width={40} color="black" />
        </div>
      ) : (
        <TableThree
          orders={orders}
          onCancel={handleDelete}
          onUpdateStatus={handleUpdateStatus}
          // @ts-ignore - Passing extra prop for cancellation logic
          onHandleCancellation={handleCancellationRequest}
        />
      )}
    </div>
  );
};

export default Orders;
