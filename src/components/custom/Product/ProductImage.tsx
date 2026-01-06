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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomOrigin(`${x}% ${y}%`);
      setIsZoomed(true);
    }
  };

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

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [mainImage]);



  const imagesToDisplay = showAllImages
    ? validImages
    : validImages.slice(0, 3);

  return (
    <div className="h-full lg:w-[60%] flex flex-col-reverse lg:flex-row gap-4 py-8 select-none">
      {/* Thumbnails - Left on desktop, Bottom on mobile */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar py-2 lg:py-0 lg:h-[500px]">
        {validImages.length > 0 &&
          imagesToDisplay.map((imageUrl: string, index: number) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Thumbnail ${index}`}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-md cursor-pointer object-cover border-2 transition-all ${mainImage === imageUrl
                ? "border-black ring-1 ring-black"
                : "border-transparent hover:border-gray-300"
                }`}
              onMouseEnter={() => handleThumbnailClick(imageUrl)}
              onClick={() => handleThumbnailClick(imageUrl)}
            />
          ))}

        {/* View More Button */}
        {validImages.length > 3 && !showAllImages && (
          <button
            className="w-16 h-16 md:w-20 md:h-20 rounded-md cursor-pointer border border-gray-200 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-[10px] uppercase font-bold text-gray-600 transition-colors shrink-0 leading-tight p-1 text-center"
            onClick={() => setShowAllImages(true)}
          >
            <span>View</span>
            <span>More</span>
          </button>
        )}

        {/* View Less Button */}
        {validImages.length > 3 && showAllImages && (
          <button
            className="w-16 h-16 md:w-20 md:h-20 rounded-md cursor-pointer border border-gray-200 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-[10px] uppercase font-bold text-gray-600 transition-colors shrink-0 leading-tight p-1 text-center"
            onClick={() => setShowAllImages(false)}
          >
            <span>View</span>
            <span>Less</span>
          </button>
        )}
      </div>

      {/* Main Image */}
      <div className="flex-1 bg-[#f7f7f7] rounded-xl flex items-center justify-center p-6 lg:h-[600px] relative overflow-hidden group">
        <img
          src={mainImage || product.defaultImage || "https://placehold.co/600x400?text=No+Image"}
          alt="Main Display"
          onClick={handleImageClick}
          style={{
            transformOrigin: zoomOrigin,
            transform: isZoomed ? "scale(2.5)" : "scale(1)",
            cursor: isZoomed ? "zoom-out" : "zoom-in"
          }}
          className="max-w-full max-h-full object-contain transition-transform duration-500"
        />
      </div>
    </div>
  );
};

export default ProductImage;
