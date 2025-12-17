import React, { useEffect, useState } from "react";
import {
  fetchAllOrders,
  cancelOrder,
  updateOrderStatus,
  deleteOrder,
} from "../../utils/OrderUtils";
import TableThree from "@/Admin/components/Tables/TableThree";
import ReactLoading from "react-loading";
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchAndSetOrders = async () => {
      try {
        const allOrdersData = await fetchAllOrders();
        setOrders(allOrdersData);
      } catch (error) {
        console.error("Error fetching all orders: ", error);
        setError("Failed to fetch orders. Please try again later."); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetOrders();
  }, []);

  const handleCancel = async (userId, orderId) => {
    try {
      await deleteOrder(userId, orderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.orderId !== orderId)
      );
    } catch (error) {
      console.error("Error canceling order: ", error);
    }
  };

  const handleUpdateStatus = async (userId, orderId, newStatus) => {
    if (!newStatus) return; // Prevent undefined status

    try {
      await updateOrderStatus(userId, orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status: ", error);
      setError("Failed to update order status. Please try again."); // Set error message
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="text-center text-lg font-semibold text-gray-600">
            <ReactLoading type={"bars"} height={30} width={30} color="black" />
          </div>
          {/* You could add a spinner here */}
        </div>
      ) : error ? (
        <div className="text-center text-lg font-semibold text-red-500">
          {error}
        </div>
      ) : (
        <TableThree
          orders={orders}
          onCancel={handleCancel}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default Orders;
