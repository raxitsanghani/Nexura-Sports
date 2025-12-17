import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Confetti from "react-confetti"; // Import the confetti library

const OrderConfirmation = () => {
  const { state } = useLocation();
  const { orderId, price, address, card, paymentMethod } = state?.order || {};

  // To control the visibility of the confetti
  const [showConfetti, setShowConfetti] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Hide confetti after 5 seconds and apply fade-out smoothly
    const timer = setTimeout(() => {
      setFadeOut(true); // Start fade-out effect
      setTimeout(() => setShowConfetti(false), 2000); // Remove confetti after fade-out
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!state?.order) {
    return <p>No order information available.</p>;
  }

  return (
    <div className="relative">
      {showConfetti && (
        <div
          className={`absolute w-screen inset-0 ${fadeOut ? "fade-out" : ""}`}
        >
          <Confetti />
        </div>
      )}
      <section className="bg-white py-8 dark:bg-gray-900 md:py-16">
        <div className="mx-auto max-w-2xl px-4 2xl:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Thank you for your order!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
            Your order{" "}
            <a
              href="#"
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              {orderId}
            </a>{" "}
            will be processed shortly. We'll notify you by email once it's
            shipped.
          </p>
          <div className="space-y-4 sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8">
            <div className="flex justify-between mb-2">
              <div className="font-normal text-gray-500 dark:text-gray-400">
                Order ID
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {orderId}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-normal text-gray-500 dark:text-gray-400">
                Total Price
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                ₹{price?.toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-normal text-gray-500 dark:text-gray-400">
                Address
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {address.name}, {address.city}, {address.state} -{" "}
                {address.zipcode}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="font-normal text-gray-500 dark:text-gray-400">
                Phone
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {address.mobile}
              </div>
            </div>
            {card && (
              <div className="flex justify-between mb-2">
                <div className="font-normal text-gray-500 dark:text-gray-400">
                  Card
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {card.name} - {card.number}
                </div>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <div className="font-normal text-gray-500 dark:text-gray-400">
                Payment Method
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {paymentMethod}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to={"/"}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none dark:focus:ring-blue-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderConfirmation;
