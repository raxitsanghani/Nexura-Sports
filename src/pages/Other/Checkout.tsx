import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { clearCartItems } from "@/utils/cartOperations";
// Initialize Firestore
const db = getFirestore();

const Checkout = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    city: "",
    state: "",
    zipcode: "",
    mobile: "",
  });
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    expiry: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalOriginalPrice, setTotalOriginalPrice] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [storePickupFee, setStorePickupFee] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [cartItems, setCartItems] = useState<any>();
  const { state } = location;
  const {
    totalPrice: initialTotalPrice = 0,
    totalOriginalPrice: initialTotalOriginalPrice = 0,
    totalDiscount: initialTotalDiscount = 0,
    storePickupFee: initialStorePickupFee = 0,
    tax: initialTax = 0,
    cartItems: initialCartItems,
  } = state || {};
  // Fetch user data and cart items
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAddresses(userData?.addresses || []);
            setCards(userData?.cards || []);
            setCartItems(userData?.setCartItems || initialCartItems);
            setTotalOriginalPrice(
              userData?.totalOriginalPrice || initialTotalOriginalPrice
            );
            setTotalPrice(userData?.totalPrice || initialTotalPrice);
            setTotalDiscount(userData?.totalDiscount || initialTotalDiscount);
            setStorePickupFee(
              userData?.storePickupFee || initialStorePickupFee
            );
            setTax(userData?.tax || initialTax);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [
    auth.currentUser,
    initialTotalOriginalPrice,
    initialTotalDiscount,
    initialStorePickupFee,
    initialTax,
    initialTotalPrice,
    initialCartItems,
  ]);
  console.log(cartItems);
  const handleAddNewAddress = async () => {
    event?.preventDefault();
    // Clear the selected address
    setSelectedAddress("");

    // Destructure newAddress fields for validation
    const { name, city, state, zipcode, mobile } = newAddress;

    // Check if any field is empty
    if (!name || !city || !state || !zipcode || !mobile) {
      console.error("All fields are required to add a new address.");
      return; // Exit the function if validation fails
    }

    const user = auth.currentUser;
    if (user) {
      try {
        // Reference to the user's document in Firestore
        const userDocRef = doc(db, "users", user.uid);

        // Update the user's addresses field with the new address
        await updateDoc(userDocRef, {
          addresses: arrayUnion(newAddress),
        });

        // Update local state
        setAddresses((prev) => [...prev, newAddress]);

        // Reset newAddress state
        setNewAddress({
          name: "",
          city: "",
          state: "",
          zipcode: "",
          mobile: "",
        });

        console.log("Address added successfully!");
      } catch (error) {
        console.error("Error adding new address:", error);
      }
    }
  };

  const handleExpiryInput = (e: any) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    // Automatically add slash after the first 2 digits
    if (input.length > 2) {
      input = `${input.slice(0, 2)}/${input.slice(2, 4)}`;
    }

    if (input.length <= 5) {
      // Limit total input length (including slash) to 5 characters
      setNewCard((prev) => ({
        ...prev,
        expiry: input,
      }));
    }
  };

  const handleCardNumberInput = (e: any) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    // Automatically add dash after every 4 digits
    if (input.length > 4 && input.length <= 8) {
      input = `${input.slice(0, 4)}-${input.slice(4)}`;
    } else if (input.length > 8 && input.length <= 12) {
      input = `${input.slice(0, 4)}-${input.slice(4, 8)}-${input.slice(8)}`;
    } else if (input.length > 12) {
      input = `${input.slice(0, 4)}-${input.slice(4, 8)}-${input.slice(
        8,
        12
      )}-${input.slice(12)}`;
    }

    if (input.length <= 19) {
      // Limit total input length (including dashes) to 19 characters
      setNewCard((prev) => ({
        ...prev,
        number: input,
      }));
    }
  };

  const handleAddNewCard = async (e: any) => {
    e.preventDefault(); // Prevent default form submission
    setNewCard({
      number: "",
      name: "",
      expiry: "",
    });
    // Validation checks
    if (!newCard.name || !newCard.number || !newCard.expiry) {
      console.error("Please fill out all fields.");
      return; // Stop execution if any field is empty
    }

    // Additional validation for card number format (basic check for 16 digits)
    const cardNumberPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!cardNumberPattern.test(newCard.number)) {
      console.error(
        "Invalid card number. It should be in the format xxxx-xxxx-xxxx-xxxx."
      );
      return;
    }

    // Additional validation for expiry date (basic MM/YY format)
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(newCard.expiry)) {
      console.error("Invalid expiration date. Use MM/YY format.");
      return;
    }

    // If all validations pass, proceed with adding the card
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          cards: arrayUnion(newCard),
        });
        setCards((prev) => [...prev, newCard]);
        setNewCard({
          number: "",
          name: "",
          expiry: "",
        });
        console.log("Card added successfully!");
      } catch (error) {
        console.error("Error adding new card:", error);
      }
    }
  };

  const handleCheckout = async () => {
    event?.preventDefault();
    const user = auth.currentUser;
    if (user && selectedAddress && (selectedCard || paymentMethod === "COD")) {
      try {
        const orderId = `#${Math.random()
          .toString(36)
          .toUpperCase()
          .substr(2, 9)}`;
        const orderData = {
          orderId,
          price: totalPrice,
          address: selectedAddress,
          card: selectedCard,
          paymentMethod,
          products: cartItems,
          timestamp: Timestamp.now(),
          status: "Pre-order",
        };

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          orders: arrayUnion(orderData),
        });
        clearCartItems(user.uid);
        navigate("/order-confirmation", {
          state: { order: orderData },
        });
      } catch (error) {
        console.error("Error placing order:", error);
      }
    } else {
      console.error("Address and payment method must be selected.");
    }
  };

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <form action="#" className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Delivery Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  {" "}
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    {" "}
                    Your Address
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    onChange={(e) =>
                      setSelectedAddress(JSON.parse(e.target.value))
                    }
                    value={
                      selectedAddress ? JSON.stringify(selectedAddress) : ""
                    }
                  >
                    <option value="">Select an address</option>
                    {addresses.map((address, index) => (
                      <option key={index} value={JSON.stringify(address)}>
                        {address.name}, {address.city}, {address.state} -{" "}
                        {address.zipcode}
                      </option>
                    ))}
                  </select>
                </div>
                {!selectedAddress && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Your name
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="Bonnie Green"
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        {" "}
                        State*{" "}
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="Gujarat"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="your_city"
                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {" "}
                        City*{" "}
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="Ahmedabad"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        {" "}
                        Zip-code*{" "}
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="380053"
                        value={newAddress.zipcode}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            zipcode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        {" "}
                        Phone number*{" "}
                      </label>
                      <input
                        type="number"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                        placeholder="9998887770"
                        value={newAddress.mobile}
                        onChange={(e) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            mobile: e.target.value,
                          }))
                        }
                      />{" "}
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    onClick={handleAddNewAddress}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                  >
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14m-7 7V5"
                      />
                    </svg>
                    Add new address
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* //Buttons */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 ps-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        type="radio"
                        id="payment-card"
                        name="payment-method"
                        value="Card"
                        checked={paymentMethod === "Card"}
                        onChange={() => setPaymentMethod("Card")}
                        className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                      />
                    </div>
                    <div className="ms-4 text-sm">
                      <label
                        htmlFor="credit-card"
                        className="font-medium leading-none text-gray-900 dark:text-white"
                      >
                        Credit Card
                      </label>
                      <p
                        id="credit-card-text"
                        className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400"
                      >
                        Pay with your credit card
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-3 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 ps-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        type="radio"
                        id="payment-cod"
                        name="payment-method"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                      />
                    </div>
                    <div className="ms-4 text-sm">
                      <label
                        htmlFor="pay-on-delivery"
                        className="font-medium leading-none text-gray-900 dark:text-white"
                      >
                        Payment on delivery
                      </label>
                      <p
                        id="pay-on-delivery-text"
                        className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400"
                      >
                        +₹15 payment processing fee
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {paymentMethod === "Card" && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 ps-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="text-xl font-semibold mb-2">Select Card</h3>

                  <label
                    htmlFor="cards"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Choose a card
                  </label>
                  <select
                    id="cards"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedCard(
                        value === "new" ? null : JSON.parse(value)
                      );
                    }}
                    value={selectedCard}
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {cards.length > 0 && (
                      <>
                        {cards.map((card, index) => (
                          <option key={index} value={JSON.stringify(card)}>
                            {card.name} - {card.number}
                          </option>
                        ))}
                      </>
                    )}
                    <option value="new">Add New Card</option>
                  </select>

                  {/* If the user selects "Add New Card" option */}
                  {
                    <>
                      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                        <div className="mx-auto max-w-5xl">
                          <div className="mt-6 flex items-center justify-center gap-8">
                            <img
                              className="h-8 w-auto dark:hidden"
                              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal.svg"
                              alt=""
                            />
                            <img
                              className="hidden h-8 w-auto dark:flex"
                              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal-dark.svg"
                              alt=""
                            />
                            <img
                              className="h-8 w-auto dark:hidden"
                              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa.svg"
                              alt=""
                            />
                            <img
                              className="hidden h-8 w-auto dark:flex"
                              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa-dark.svg"
                              alt=""
                            />
                            <img
                              className="h-8 w-auto dark:hidden"
                              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard.svg"
                              alt=""
                            />
                            <img
                              className="hidden h-8 w-auto dark:flex"
                              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard-dark.svg"
                              alt=""
                            />
                          </div>

                          <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12">
                            <form
                              action="#"
                              className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:max-w-xl lg:p-8"
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAddNewCard(e); // Call function to handle adding a new card
                              }}
                            >
                              <div className="mb-6 grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                  <label
                                    htmlFor="full_name"
                                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Full name (as displayed on card)*
                                  </label>
                                  <input
                                    type="text"
                                    id="full_name"
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    placeholder="Bonnie Green"
                                    required
                                    value={newCard.name}
                                    onChange={(e) =>
                                      setNewCard((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                  <label
                                    htmlFor="card-number-input"
                                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Card number*
                                  </label>
                                  <input
                                    type="text"
                                    id="card-number-input"
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    placeholder="xxxx-xxxx-xxxx-xxxx"
                                    required
                                    maxLength={19}
                                    value={newCard.number}
                                    onChange={() =>
                                      handleCardNumberInput(event)
                                    }
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor="card-expiration-input"
                                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Card expiration*
                                  </label>

                                  <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
                                      <svg
                                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          fill-rule="evenodd"
                                          d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                                          clip-rule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <input
                                      type="text"
                                      id="card-expiration-input"
                                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                      placeholder="12/23"
                                      required
                                      value={newCard.expiry}
                                      onChange={() => handleExpiryInput(event)}
                                    />
                                  </div>
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={handleAddNewCard}
                              >
                                Add new card
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </>
                  }
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
            <div className="flow-root">
              <div className="-my-3 divide-y divide-gray-200 dark:divide-gray-800">
                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Subtotal
                  </dt>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    ₹ {totalOriginalPrice.toFixed(2)}
                  </div>
                </dl>
                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Savings
                  </dt>
                  <div className="text-base font-medium text-green-500">
                    - ₹ {totalDiscount.toFixed(2)}
                  </div>
                </dl>
                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Store Pickup
                  </dt>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    + ₹ {storePickupFee.toFixed(2)}
                  </div>
                </dl>
                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Tax
                  </dt>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    + ₹ {tax.toFixed(2)}
                  </div>
                </dl>
                <dl className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </dt>
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    ₹ {totalPrice.toFixed(2)}
                  </div>
                </dl>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-4  focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                onClick={handleCheckout}
              >
                Proceed to Payment
              </button>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                One or more items in your cart require an account.{" "}
                <a
                  href="#"
                  title=""
                  className="font-medium text-blue-500 underline hover:no-underline dark:text-blue-500"
                >
                  Sign in or create an account now.
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;
