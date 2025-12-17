// TableTwo.tsx

import React from "react";
import { Product, TableTwoProps } from "../../types/types"; // Adjust the import based on your file structure

const TableTwo: React.FC<TableTwoProps> = ({ products, onDelete }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="py-4 px-4">Product Name</th>
            <th className="py-4 px-4">Price</th>
            <th className="py-4 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr key={product.id}>
              <td className="border-b py-4 px-4">{product.name}</td>
              <td className="border-b py-4 px-4">${product.price}</td>
              <td className="border-b py-4 px-4">
                <button
                  onClick={() => alert("Edit functionality coming soon!")}
                  className="text-blue-500 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableTwo;
