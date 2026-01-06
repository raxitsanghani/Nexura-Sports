import React, { useEffect, useState } from "react";
import { db } from "@/Database/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Product, Review } from "@/types";
import { Rating } from "react-simple-star-rating";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProductWithReviews extends Product {
    reviews: Review[];
}

const ProductReviews = () => {
    const [ratedProducts, setRatedProducts] = useState<ProductWithReviews[]>([]);

    useEffect(() => {
        const fetchRatedProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const products: ProductWithReviews[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Product;
                    if (data.reviews && data.reviews.length > 0) {
                        // @ts-ignore
                        products.push({ id: doc.id, ...data });
                    }
                });
                setRatedProducts(products);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to load product reviews.");
            }
        };

        fetchRatedProducts();
    }, []);

    const handleDeleteReview = async (productId: string, reviewIndex: number) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this review? This action cannot be undone."
        );
        if (!confirmDelete) return;

        try {
            const product = ratedProducts.find((p) => p.id === productId);
            if (!product) return;

            const updatedReviews = product.reviews.filter(
                (_, index) => index !== reviewIndex
            );

            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                reviews: updatedReviews,
            });

            // Update local state by creating a new array reference
            const updatedProducts = ratedProducts
                .map((p) => {
                    if (p.id === productId) {
                        return { ...p, reviews: updatedReviews };
                    }
                    return p;
                })
                .filter((p) => p.reviews.length > 0); // Optionally remove product if no reviews left, or keep it. keeping for now if 0 reviews? user said "all products that have at least one rating". So if 0, maybe remove.

            setRatedProducts(updatedProducts);
            toast.success("Review deleted successfully!");

        } catch (error) {
            console.error("Error deleting review: ", error);
            toast.error("Failed to delete review.");
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-3xl font-bold text-center mb-8 text-black">Product Reviews</h1>

            {ratedProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No reviews found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {ratedProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Product Header */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-100">
                                <img
                                    src={product.defaultImage}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Total Reviews: <span className="font-semibold text-gray-700">{product.reviews.length}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Reviews Grid */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {product.reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col h-full bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        {/* 1. User Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-shrink-0">
                                                {review.reviewerPhoto ? (
                                                    <img
                                                        src={review.reviewerPhoto}
                                                        alt={review.reviewerName}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                        {review.reviewerName?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{review.reviewerName || "Anonymous"}</h4>
                                                <p className="text-xs text-gray-400">{review.date}</p>
                                            </div>
                                        </div>

                                        {/* 2. Review Text */}
                                        <div className="mb-4 flex-grow">
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                "{review.reviewText}"
                                            </p>
                                        </div>

                                        {/* 3. Star Rating */}
                                        <div className="mb-4">
                                            <Rating
                                                readonly
                                                initialValue={review.rating}
                                                size={18}
                                                allowFraction={true}
                                                SVGstyle={{ display: "inline-block" }}
                                            />
                                        </div>

                                        {/* 4. Delete Button (Bottom) */}
                                        <button
                                            onClick={() => handleDeleteReview(product.id, index)}
                                            className="w-full mt-auto bg-red-50 text-red-600 py-2.5 rounded-lg text-xs font-bold hover:bg-red-100 hover:text-red-700 transition-all active:scale-95"
                                        >
                                            Delete Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
