import { useEffect, useState } from "react";
import { db } from "@/Database/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Product, Review } from "@/types";
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

            const updatedProducts = ratedProducts
                .map((p) => {
                    if (p.id === productId) {
                        return { ...p, reviews: updatedReviews };
                    }
                    return p;
                })
                .filter((p) => p.reviews.length > 0);

            setRatedProducts(updatedProducts);
            toast.success("Review deleted successfully!");

        } catch (error) {
            console.error("Error deleting review: ", error);
            toast.error("Failed to delete review.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="flex flex-col gap-2 text-center mb-12">
                <h2 className="text-4xl font-black tracking-tight text-slate-900">Feedback Intelligence</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Consumer Sentiment Analysis</p>
            </div>

            {ratedProducts.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 border border-slate-100 text-center shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                    <div className="text-4xl mb-4">🔇</div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No feedback records detected in global archive</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {ratedProducts.map((product) => (
                        <div key={product.id} className="space-y-8">
                            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 ml-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-slate-200 border border-white">
                                    <img
                                        src={product.defaultImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{product.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry ID: {product.id.slice(0, 8)}...</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">{product.reviews.length} Validated Reviews</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {product.reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="group bg-white rounded-[2rem] p-8 border border-slate-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between"
                                    >
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-4 ring-slate-50/50">
                                                        {review.reviewerPhoto ? (
                                                            <img
                                                                src={review.reviewerPhoto}
                                                                alt={review.reviewerName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                                                {review.reviewerName?.charAt(0).toUpperCase() || "U"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[120px]">{review.reviewerName || "Anonymous"}</h4>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{review.date}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                    <span className="text-[9px] font-black text-amber-600">{review.rating}</span>
                                                    <span className="text-[10px]">⭐</span>
                                                </div>
                                            </div>

                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4 py-2">
                                                "{review.reviewText}"
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteReview(product.id, index)}
                                            className="w-full mt-8 bg-slate-50 text-rose-500 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all transform active:scale-95 opacity-0 group-hover:opacity-100"
                                        >
                                            Purge Feedback
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
