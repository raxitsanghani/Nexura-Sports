import React, { useState } from "react";
import { CgSandClock } from "react-icons/cg";
import { FiTruck, FiAlertCircle } from "react-icons/fi";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
// @ts-ignore
import { TableThreeProps } from "../../types/types";

interface ExtendedProps extends TableThreeProps {
  onHandleCancellation?: (orderId: string, action: 'accept' | 'reject') => void;
}

const TableThree: React.FC<ExtendedProps> = ({
  orders,
  onCancel,
  onUpdateStatus,
  onHandleCancellation
}) => {
  const [statusUpdate, setStatusUpdate] = useState<{
    [key: string]: string | undefined;
  }>({});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pre-order":
      case "Processing":
        return <CgSandClock className="text-yellow-500" />;
      case "In transit":
        return <FiTruck className="text-blue-500" />;
      case "Confirmed":
        return <IoCheckmarkSharp className="text-green-500" />;
      case "Cancelled":
        return <RxCross2 className="text-red-500" />;
      case "Cancellation Requested":
        return <FiAlertCircle className="text-orange-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatusUpdate((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  // Convert legacy array prop or handle empty if needed
  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Order Info
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Customer
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Date
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {safeOrders.map((order: any) => (
              <tr key={order.orderId}>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black font-medium dark:text-white">{order.orderId}</p>
                  <p className="text-sm text-gray-500">₹{order.price}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">{order.userName}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-sm">{order.timestamp}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">{order.status}</span>
                    </span>
                    {order.status === "Cancellation Requested" && order.cancellationReason && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 italic">
                        "{order.cancellationReason}"
                      </span>
                    )}
                  </div>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex flex-col space-y-2">
                    {order.status === "Cancellation Requested" ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onHandleCancellation && onHandleCancellation(order.orderId, 'accept')}
                          className="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600 text-sm font-medium transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => onHandleCancellation && onHandleCancellation(order.orderId, 'reject')}
                          className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600 text-sm font-medium transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : order.status === "Cancelled" ? (
                      <button
                        onClick={() => onCancel(order.userId, order.orderId)}
                        className="bg-red-500 text-white rounded px-3 py-1 text-sm hover:bg-red-600 transition"
                      >
                        Delete Order
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <select
                            value={statusUpdate[order.orderId] || order.status}
                            onChange={(e) =>
                              handleStatusChange(order.orderId, e.target.value)
                            }
                            className="border rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Processing">Processing</option>
                            <option value="In transit">In transit</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              const newStatus = statusUpdate[order.orderId];
                              if (newStatus) {
                                onUpdateStatus(
                                  order.userId,
                                  order.orderId,
                                  newStatus
                                );
                                setStatusUpdate((prev) => ({
                                  ...prev,
                                  [order.orderId]: undefined,
                                }));
                              }
                            }}
                            className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700 transition"
                          >
                            Update
                          </button>
                        </div>
                        <button
                          onClick={() => onCancel(order.userId, order.orderId)}
                          className="bg-red-500 text-white rounded px-3 py-1 text-sm hover:bg-red-600 transition self-end"
                        >
                          Delete Order
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default TableThree;
