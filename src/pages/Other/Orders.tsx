import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { fetchOrders } from "@/utils/fetchOrders"; // Adjust import if needed
import { CgSandClock } from "react-icons/cg";
import { FiTruck } from "react-icons/fi";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { cancelOrder, removeOrder } from "@/utils/createOrderInFirebase";
import ReactLoading from "react-loading";

interface Order {
  orderId: string;
  date: string;
  time: string;
  price: string;
  status: string;
  products: Record<string, { quantity: number }>;
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadOrders = async () => {
      if (userId) {
        try {
          const ordersData = await fetchOrders(userId);
          // @ts-ignore
          setOrders(ordersData);
        } catch (error) {
          console.error("Error fetching orders: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("User ID is undefined.");
        setLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(userId!, orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Error handling cancel button click: ", error);
    }
  };

  const handleRemove = async (orderId: string) => {
    try {
      await removeOrder(userId!, orderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.orderId !== orderId)
      );
    } catch (error) {
      console.error("Error handling remove button click: ", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center text-lg font-semibold text-gray-600">
          <ReactLoading type={"bars"} height={30} width={30} color="black" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-lg font-semibold text-gray-600">
          No orders found.
        </div>
      ) : (
        <section className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h2>
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="relative flex flex-wrap items-center gap-y-4 py-6 border-b border-gray-200 last:border-b-0"
                >
                  {order.status === "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleRemove(order.orderId)}
                      className="absolute top-2 right-2 rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
                    >
                      <RxCross2 />
                    </button>
                  )}
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-base font-medium text-gray-600">
                      Order ID:
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-800">
                      <a href="#" className="hover:underline">
                        {order.orderId}
                      </a>
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-base font-medium text-gray-600">
                      Date:
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-800">
                      {order.date}
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-base font-medium text-gray-600">
                      Time:
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-800">
                      {order.time}
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-base font-medium text-gray-600">
                      Price:
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-800">
                      ₹ {order.price}
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/4">
                    <h3 className="text-base font-medium text-gray-600">
                      Status:
                    </h3>
                    <div
                      className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${order.status === "Pre-order"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "In transit"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                    >
                      {order.status === "Pre-order" && <CgSandClock />}
                      {order.status === "In transit" && <FiTruck />}
                      {order.status === "Confirmed" && <IoCheckmarkSharp />}
                      {order.status !== "Confirmed" &&
                        order.status !== "In transit" &&
                        order.status !== "Pre-order" && <RxCross2 />}
                      {order.status}
                    </div>
                  </div>
                  <div className="w-full flex space-x-4">
                    {order.status !== "Cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.orderId)}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
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
