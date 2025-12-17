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
        <div className="container mx-auto p-6 bg-white rounded shadow-md">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-3xl font-bold text-center mb-8 text-black">Product Reviews</h1>

            {ratedProducts.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">No reviews found.</p>
            ) : (
                <div className="space-y-10">
                    {ratedProducts.map((product) => (
                        <div key={product.id} className="border border-gray-200 p-6 rounded-lg bg-gray-50 shadow-sm">
                            <div className="flex items-center gap-6 mb-6 border-b border-gray-200 pb-4">
                                <img
                                    src={product.defaultImage}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded-md border border-gray-300"
                                />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
                                    <p className="text-gray-600">
                                        Total Reviews: <span className="font-semibold">{product.reviews.length}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                                {product.reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="p-5 bg-white border border-gray-200 rounded-md shadow-sm relative hover:shadow-md transition-shadow"
                                    >
                                        <button
                                            onClick={() => handleDeleteReview(product.id, index)}
                                            className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>

                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="flex-shrink-0">
                                                {review.reviewerPhoto ? (
                                                    <img
                                                        src={review.reviewerPhoto}
                                                        alt={review.reviewerName}
                                                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                                                        {review.reviewerName?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-col">
                                                    <h4 className="font-bold text-gray-800 text-lg">{review.reviewerName}</h4>
                                                    {review.reviewerEmail && (
                                                        <span className="text-sm text-gray-500">{review.reviewerEmail}</span>
                                                    )}
                                                    <span className="text-xs text-gray-400 mt-1">{review.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <Rating
                                                readonly
                                                initialValue={review.rating}
                                                size={22}
                                                allowFraction={true}
                                                SVGstyle={{ display: "inline-block" }}
                                            />
                                        </div>

                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded italic text-sm border border-gray-100">
                                            "{review.reviewText}"
                                        </p>
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
