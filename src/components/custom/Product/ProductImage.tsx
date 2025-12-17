import { useState, useEffect } from "react";

interface ProductImageProps {
  selectedColor: string | null;
  product: {
    defaultImage?: string;
    imageUrls?: Record<string, string[]>;
  };
}

const ProductImage = ({ selectedColor, product }: ProductImageProps) => {
  const [mainImage, setMainImage] = useState<string | undefined>(
    selectedColor
      ? product.imageUrls?.[selectedColor]?.[0]
      : product.defaultImage
  );
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    if (selectedColor && product.imageUrls?.[selectedColor]) {
      setMainImage(product.imageUrls[selectedColor][0]);
    } else {
      setMainImage(product.defaultImage);
    }
  }, [selectedColor, product.imageUrls, product.defaultImage]);

  const handleThumbnailClick = (imageUrl: string) => {
    setMainImage(imageUrl);
  };

  const handleSeeMoreClick = () => {
    setShowAllImages(true);
  };

  const imagesToDisplay = showAllImages
    ? // @ts-ignore
      product.imageUrls?.[selectedColor] || []
    : // @ts-ignore
      (product.imageUrls?.[selectedColor] || []).slice(0, 3);

  return (
    <div className="h-full lg:w-[50%] float-start lg:flex-row flex py-11 flex-col justify-center items-center gap-2 lg:justify-center">
      <div className="lg:h-[33.4rem] md:h-[34rem]">
        <img
          src={mainImage || product.defaultImage}
          alt="Main Display"
          className="h-full rounded-lg object-cover"
        />
      </div>
      <div className="flex lg:flex-col gap-2 md:-mt-[1px] mt-2">
        {selectedColor &&
          imagesToDisplay.map((imageUrl: string, index: number) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Thumbnail ${index}`}
              className={`lg:w-32 md:w-20 w-14 h-14 md:h-20 lg:h-32 rounded-lg cursor-pointer border-2 ${
                mainImage === imageUrl
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
              onClick={() => handleThumbnailClick(imageUrl)}
            />
          ))}
        {/* @ts-ignore */}
        {product.imageUrls?.[selectedColor]?.length > 3 && !showAllImages && (
          <button
            className="lg:w-32 md:w-20 w-14 h-14 md:h-20 lg:h-32 rounded-lg cursor-pointer border-2 "
            onClick={handleSeeMoreClick}
          >
            See More
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductImage;
