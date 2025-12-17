// TableThree.tsx

import React, { useState } from "react";
import { CgSandClock } from "react-icons/cg";
import { FiTruck } from "react-icons/fi";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { Order, TableThreeProps } from "../../types/types"; // Adjust the import based on your file structure

const TableThree: React.FC<TableThreeProps> = ({
  orders,
  onCancel,
  onUpdateStatus,
}) => {
  const [statusUpdate, setStatusUpdate] = useState<{
    [key: string]: string | undefined;
  }>({});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pre-order":
        return <CgSandClock className="text-yellow-500" />;
      case "In transit":
        return <FiTruck className="text-blue-500" />;
      case "Confirmed":
        return <IoCheckmarkSharp className="text-green-500" />;
      case "Cancelled":
        return <RxCross2 className="text-red-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatusUpdate((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                User ID
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                User Name
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Order ID
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Invoice Date
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
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {order.userId}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {order.userName}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {order.orderId}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {new Date(order.timestamp).toLocaleDateString()}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark flex items-center">
                  <span className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 font-medium">{order.status}</span>
                  </span>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => onCancel(order.userId, order.orderId)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <div className="flex items-center space-x-2">
                      <select
                        value={statusUpdate[order.orderId] || order.status}
                        onChange={(e) =>
                          handleStatusChange(order.orderId, e.target.value)
                        }
                        className="border rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pre-order">Pre-order</option>
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
                        className="bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600 transition duration-200"
                        aria-label={`Update status for order ${order.orderId}`}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableThree;
