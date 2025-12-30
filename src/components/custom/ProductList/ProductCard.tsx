import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

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

    const availableImageKeys = Object.keys(imageUrls);

    // Filter and unique colors
    const displayKeys = Array.from(new Set([
        ...explicitColors.filter(c => imageUrls[c] && imageUrls[c].length > 0),
        ...availableImageKeys
    ])).reverse();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showArrows, setShowArrows] = useState(false);

    const checkScrollable = () => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowArrows(scrollWidth > clientWidth);
        }
    };

    useEffect(() => {
        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        return () => window.removeEventListener('resize', checkScrollable);
    }, [displayKeys]);

    return (
        <motion.div
            className="relative group flex flex-col h-full bg-white hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden border border-transparent hover:border-gray-100"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Badge */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {product.discount && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                        {product.discount.replace(/off/i, "").trim()} OFF
                    </span>
                )}
            </div>

            {/* Favorite Icon */}
            <button
                type="button"
                className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-700 hover:text-red-500 hover:bg-white transition-all transform hover:scale-110"
                onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(product.id);
                }}
            >
                {isFavorite ? <FaHeart className="w-4 h-4 text-red-500" /> : <FaRegHeart className="w-4 h-4" />}
            </button>

            {/* Main Image Area */}
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-[#f7f7f7]">
                <motion.img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </Link>

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-3 flex-grow">
                {/* Color Options */}
                <div className="relative group/colors h-10 flex items-center">
                    {showArrows && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -80, behavior: 'smooth' });
                            }}
                            className="absolute left-0 z-10 bg-white/90 shadow h-8 w-6 flex items-center justify-center rounded-sm opacity-0 group-hover/colors:opacity-100 transition-opacity"
                        >
                            <FaChevronLeft className="w-3 h-3 text-gray-600" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-2 overflow-x-auto no-scrollbar w-full items-center scroll-smooth"
                    >
                        {displayKeys.map((color, index) => {
                            const colorImg = imageUrls[color]?.[0];
                            if (!colorImg) return null;
                            const isActive = currentImage === colorImg;
                            return (
                                <button
                                    key={`${color}-${index}`}
                                    onMouseEnter={() => setCurrentImage(colorImg)}
                                    // onClick={() => setCurrentImage(colorImg)} 
                                    className={`w-10 h-10 border rounded-sm flex-shrink-0 overflow-hidden transition-all ${isActive ? 'border-black ring-1 ring-black p-[2px]' : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                    title={color}
                                >
                                    <img src={colorImg} alt={color} className="w-full h-full object-cover" />
                                </button>
                            );
                        })}
                    </div>

                    {showArrows && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 80, behavior: 'smooth' });
                            }}
                            className="absolute right-0 z-10 bg-white/90 shadow h-8 w-6 flex items-center justify-center rounded-sm opacity-0 group-hover/colors:opacity-100 transition-opacity"
                        >
                            <FaChevronRight className="w-3 h-3 text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate">
                        {product.categories?.[0] || "Shoes"}
                    </p>
                    <Link to={`/product/${product.id}`} className="group-hover:text-blue-900 transition-colors">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[40px]">
                            {product.name}
                        </h3>
                    </Link>
                    <div className="mt-2 text-lg font-bold text-gray-900">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
