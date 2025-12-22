import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface ProductCardProps {
    product: Product;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

const ProductCard = ({ product, isFavorite, onToggleFavorite }: ProductCardProps) => {
    const [currentImage, setCurrentImage] = useState<string>(
        product.defaultImage || Object.values(product.imageUrls || {})[0]?.[0]
    );

    useEffect(() => {
        setCurrentImage(product.defaultImage || Object.values(product.imageUrls || {})[0]?.[0]);
    }, [product]);

    const imageUrls = product.imageUrls || {};
    const explicitColors = product.colors || [];

    // Get all available color keys from the images map
    const availableImageKeys = Object.keys(imageUrls);

    // Create a unique set of keys to display:
    // 1. First, any colors explicitly listed in product.colors (if they have images)
    // 2. Then, any other keys found in imageUrls (fallback for forgotten tags)
    // We filter nulls/undefined and ensure unique keys
    const displayKeys = Array.from(new Set([
        ...explicitColors.filter(c => imageUrls[c] && imageUrls[c].length > 0),
        ...availableImageKeys
    ])).reverse();

    return (
        <div className="relative group flex flex-col h-full bg-white transition-shadow">
            {/* Badge / Header */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {product.discount && (
                    <span className="bg-white text-xs font-bold px-2 py-1 rounded shadow-sm text-black border border-gray-100">
                        {product.discount}
                    </span>
                )}
            </div>

            {/* Favorite Icon */}
            <button
                type="button"
                className="absolute top-2 right-2 z-10 p-2 text-gray-700 hover:text-black transition-colors"
                onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(product.id);
                }}
            >
                {isFavorite ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
            </button>

            {/* Main Image */}
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 mb-2">
                <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply p-4"
                />
            </Link>

            {/* Color Thumbnails */}
            <div className="px-3 flex gap-1 mb-2 overflow-x-auto no-scrollbar h-10 items-center">
                {displayKeys.map((color, index) => {
                    const colorImg = imageUrls[color]?.[0];
                    if (!colorImg) return null;
                    return (
                        <button
                            key={`${color}-${index}`}
                            onMouseEnter={() => setCurrentImage(colorImg)}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentImage(colorImg);
                            }}
                            className={`w-8 h-8 md:w-10 md:h-10 border rounded flex-shrink-0 overflow-hidden ${currentImage === colorImg ? 'border-black' : 'border-gray-200'}`}
                            title={product.colors?.includes(color) ? color : `${color} (Unlisted)`}
                        >
                            <img src={colorImg} alt={color} className="w-full h-full object-cover" />
                        </button>
                    );
                })}
            </div>

            {/* Product Details */}
            <div className="px-3 pb-4 flex flex-col gap-1">
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-900 line-clamp-1">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <p className="text-gray-500 text-xs text-nowrap capitalize">
                    {product.categories?.[0] ? `${product.categories[0]}'s Shoes` : "Shoes"}
                </p>
                <div className="mt-1 font-bold text-gray-900">
                    ₹{Number(product.price).toFixed(2)}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
