import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Image from "@/assets/index";
import RatingProvider from "@/components/ui/Rating";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { FiTruck } from "react-icons/fi";
import useAverageRating from "@/hooks/useAvarageRating";
import { RootState, AppDispatch } from "@/redux/store/store";
import { addToCart } from "@/redux/cartSlice";
import { handleToggleFavorite } from "@/utils/favorites";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserFavorites } from "@/utils/fetchUserFavorites";
import { handleAddToCart } from "@/utils/handleToggleCart";
import ReactLoading from "react-loading";

interface Product {
  id: string;
  name?: string;
  price?: number;
  colors?: string[];
  sizes?: number[];
  rating?: { [key: number]: number };
  imageUrls?: { [key: string]: string[] };
  defaultImage?: string;
}

interface ProductDetailsProps {
  handleColorChange: (color: string) => void;
}

const ProductDetails = ({
  handleColorChange,
}: {
  handleColorChange: (color: string) => void;
}) => {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  const dispatch: AppDispatch = useDispatch();
  const product = useSelector(
    // @ts-ignore
    (state: RootState) => state.products.products[id]
  ); // Access product using ID from URL
  const [sizeState, setSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product?.colors?.[0] || null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set userId from Firebase Authentication
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (userId && product) {
      const checkFavoriteStatus = async () => {
        try {
          const userFavorites = await fetchUserFavorites(userId);
          //@ts-ignore
          setIsFavorite(userFavorites.includes(id));
        } catch (error) {
          console.error("Error fetching user favorites: ", error);
        }
      };
      checkFavoriteStatus();
    }
  }, [userId, id, product]);

  const sizes = product?.sizes || [40.5, 41, 42, 43, 43.5, 44, 44.5, 45, 46];
  const { averageRating, totalPeople } = useAverageRating(
    product?.rating || {}
  );

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    handleColorChange(color);
  };

  const handleToggleFavoriteClick = async () => {
    if (userId) {
      try {
        // @ts-ignore
        await handleToggleFavorite(userId, id);
        setIsFavorite((prev) => !prev); // Toggle local state
      } catch (error) {
        console.error("Error toggling favorite: ", error);
      }
    } else {
      console.error("User is not authenticated.");
    }
  };

  const funcAddToCart = async () => {
    const colorToUse = selectedColor || product.colors?.[0] || "defaultColor";
    const sizeToUse = sizeState || product.sizes?.[0] || 40.5;

    if (userId) {
      try {
        // First, update Firebase using handleAddToCart
        // @ts-ignore
        await handleAddToCart(userId, id, 1, colorToUse, sizeToUse);

        // If Firebase update is successful, update the Redux state
        dispatch(
          addToCart({
            // @ts-ignore
            productId: id,
            quantity: 1,
            color: colorToUse,
            size: sizeToUse,
          })
        );

        console.log("Item successfully added to cart");
      } catch (error) {
        console.error("Error adding item to cart:", error);
      }
    } else {
      console.error("User is not authenticated.");
    }
  };

  if (!product)
    return (
      <div className="w-screen flex items-center justify-center h-screen -mt-24">
        <ReactLoading type={"bars"} height={30} width={30} color="black" />
      </div>
    ); // Handle case where product is not available

  return (
    <div className="md:px-5 py-11 md:ml-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-black rounded-full w-6 p-1">
            <img src={Image?.white} alt="Brand" />
          </div>
          <p className="font-semibold text-xs">Brand Name</p>
        </div>
        <p className="text-xs text-cs_gray">{product.name || "Product Code"}</p>
      </div>
      <h2 className="text-2xl font-semibold py-5">
        {product.name || "Product Name"}
      </h2>
      <div className="flex gap-3">
        <RatingProvider size={"16px"} rating={averageRating || 0} />
        <p className="text-cs_gray text-xs">{totalPeople || 0} reviews</p>
      </div>
      <h1 className="text-3xl font-semibold py-5">
        ₹{product.price?.toFixed(2) || "0.00"}
      </h1>

      <div>
        <div>
          Color:{" "}
          <span className="text-cs_gray">
            {selectedColor || "Select Color"}
          </span>
        </div>
        <div className="flex gap-3 mt-2">
          {/* @ts-ignore */}
          {product.colors?.map((color) => (
            <img
              src={
                product.imageUrls?.[color]?.[0] ||
                product.defaultImage ||
                Image.white
              }
              key={color}
              onClick={() => handleColorClick(color.trim())}
              className={`w-14 rounded-xl cursor-pointer border-2 ${
                color === selectedColor
                  ? "border-primary-700"
                  : "border-transparent"
              } hover:border-primary-700`}
              alt={color}
            />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <h2>Size: {sizeState !== null ? sizeState : "Select a size"}</h2>
        <div className="w-full flex flex-wrap gap-3 mt-2">
          {/* @ts-ignore */}
          {sizes.map((size) => (
            <Button
              key={size}
              variant={"outline"}
              className={`${
                size === sizeState
                  ? "bg-black text-white hover:bg-black hover:text-slate-200"
                  : ""
              } w-14`}
              onClick={() => setSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
        <h2 className="text-xs text-cs_yellow mt-3">Size guide</h2>
      </div>

      <div className="w-full mt-3">
        <div className="flex gap-2">
          <Button
            className="w-full sm:w-auto lg:w-full"
            onClick={funcAddToCart}
          >
            <HiOutlineShoppingBag size={"20px"} className="mr-2 mb-[2px]" />
            Add to cart
          </Button>
          <Button variant={"outline"} onClick={handleToggleFavoriteClick}>
            {isFavorite ? (
              <FaHeart size={"18px"} />
            ) : (
              <FaRegHeart size={"18px"} />
            )}
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          <FiTruck />
          <h2 className="text-xs font-semibold">
            Free delivery on order over ₹30.00
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
