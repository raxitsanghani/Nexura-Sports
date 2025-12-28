import { useState, useEffect } from "react";

import { findMatchingKey } from "@/utils/productUtils";

interface ProductImageProps {
  selectedColor: string | null;
  product: {
    defaultImage?: string;
    imageUrls?: Record<string, string[]>;
    colors?: string[];
    defaultColorName?: string;
  };
}

const ProductImage = ({ selectedColor, product }: ProductImageProps) => {

  // Helper to determine which color's images to show
  const getEffectiveColor = () => {
    if (selectedColor) {
      const match = findMatchingKey(product.imageUrls, selectedColor);
      if (match) return match;
    }

    // If no color selected or selected color has no images, invoke fallback logic

    // Fallback 1: Try default
    if (product.imageUrls?.["default"] && product.imageUrls["default"].length > 0) {
      return "default";
    }

    // Fallback 2: Try defaultColorName
    if (product.defaultColorName) {
      const match = findMatchingKey(product.imageUrls, product.defaultColorName);
      if (match) return match;
    }

    // Fallback 3: Try the first available color in the colors array
    if (product.colors && product.colors.length > 0) {
      for (const color of product.colors) {
        const match = findMatchingKey(product.imageUrls, color);
        if (match) return match;
      }
    }

    // Fallback 4: Try finding any key in imageUrls that has images
    if (product.imageUrls) {
      const keys = Object.keys(product.imageUrls);
      for (const key of keys) {
        if (product.imageUrls[key].length) return key;
      }
    }

    return "default";
  };

  const effectiveColor = getEffectiveColor();
  // Filter out empty or invalid URLs
  const validImages = (product.imageUrls?.[effectiveColor] || []).filter(url => url && url.trim() !== "");

  // Initialize mainImage
  const getInitialMainImage = () => {
    if (validImages.length > 0) return validImages[0];
    return product.defaultImage || Object.values(product.imageUrls || {})[0]?.[0] || "";
  };

  const [mainImage, setMainImage] = useState<string | undefined>(getInitialMainImage());
  const [showAllImages, setShowAllImages] = useState(false);

  // Sync mainImage when the effective color changes (e.g. user selects a different color)
  useEffect(() => {
    const newEffectiveColor = getEffectiveColor();
    // Filter new images as well
    const newImages = (product.imageUrls?.[newEffectiveColor] || []).filter(url => url && url.trim() !== "");

    if (newImages.length > 0) {
      setMainImage(newImages[0]);
    } else {
      setMainImage(product.defaultImage || Object.values(product.imageUrls || {})[0]?.[0]);
    }
  }, [selectedColor, product]);

  const handleThumbnailClick = (imageUrl: string) => {
    setMainImage(imageUrl);
  };



  const imagesToDisplay = showAllImages
    ? validImages
    : validImages.slice(0, 3);

  return (
    <div className="h-full lg:w-[50%] float-start lg:flex-row flex py-11 flex-col justify-center items-center gap-2 lg:justify-center">
      <div className="lg:h-[33.4rem] md:h-[34rem] w-full flex align-middle justify-center bg-gray-50 rounded-lg lg:order-2">
        <img
          src={mainImage || product.defaultImage || "https://placehold.co/600x400?text=No+Image"}
          alt="Main Display"
          className="h-full w-full rounded-lg object-contain mix-blend-multiply cursor-zoom-in"
        />
      </div>
      <div className="flex flex-wrap lg:flex-col gap-2 md:-mt-[1px] mt-2 lg:order-1">
        {validImages.length > 0 &&
          imagesToDisplay.map((imageUrl: string, index: number) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Thumbnail ${index}`}
              className={`lg:w-32 md:w-20 w-14 h-14 md:h-20 lg:h-32 rounded-lg cursor-pointer border-2 object-contain bg-white ${mainImage === imageUrl
                ? "border-blue-500"
                : "border-transparent"
                }`}
              onClick={() => handleThumbnailClick(imageUrl)}
            />
          ))}
        {/* View More Button */}
        {validImages.length > 3 && !showAllImages && (
          <button
            className="lg:w-32 md:w-20 w-14 h-14 md:h-20 lg:h-32 rounded-lg cursor-pointer border-2 flex items-center justify-center bg-white hover:bg-gray-50 text-sm font-medium"
            onClick={() => setShowAllImages(true)}
          >
            View More
          </button>
        )}

        {/* View Less Button */}
        {validImages.length > 3 && showAllImages && (
          <button
            className="lg:w-32 md:w-20 w-14 h-14 md:h-20 lg:h-32 rounded-lg cursor-pointer border-2 flex items-center justify-center bg-white hover:bg-gray-50 text-sm font-medium"
            onClick={() => setShowAllImages(false)}
          >
            View Less
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductImage;
