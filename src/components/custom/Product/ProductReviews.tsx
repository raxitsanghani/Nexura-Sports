import React, { useState, useEffect } from "react";
import { Rating } from "react-simple-star-rating";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/Database/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { Product, Review } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface ProductReviewsProps {
    product: Product;
    productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
    product,
    productId,
}) => {
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState<string>("");
    const [newRating, setNewRating] = useState<number>(0);
    const [visibleCount, setVisibleCount] = useState<number>(3);
    const [userName, setUserName] = useState<string>("Guest");
    const [userPhoto, setUserPhoto] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");

    useEffect(() => {
        // Only load reviews from the product, no dummy data
        setReviews(product.reviews || []);
    }, [product]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                if (user.displayName) setUserName(user.displayName);
                if (user.photoURL) setUserPhoto(user.photoURL);
                if (user.email) setUserEmail(user.email);

                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (!user.displayName && data.name) setUserName(data.name);
                        if (!user.photoURL && data.photoUrl) setUserPhoto(data.photoUrl);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleRating = (rate: number) => {
        setNewRating(rate);
    };

    const handleSubmitReview = async () => {
        if (!user) {
            toast({ description: "Please login to write a review.", variant: "destructive" });
            return;
        }
        if (newRating === 0) {
            toast({ description: "Please select a star rating.", variant: "destructive" });
            return;
        }
        if (!newReview.trim()) {
            toast({ description: "Please write a review text.", variant: "destructive" });
            return;
        }

        const review: Review = {
            reviewerName: userName || "Anonymous",
            reviewerPhoto: userPhoto,
            reviewerEmail: userEmail,
            rating: newRating,
            reviewText: newReview,
            date: new Date().toISOString().split("T")[0],
        };

        try {
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                reviews: arrayUnion(review),
            });

            setReviews((prev) => [review, ...prev]);
            setNewReview("");
            setNewRating(0);
            toast({ description: "Review submitted successfully!" });
        } catch (error) {
            console.error("Error submitting review: ", error);
            toast({ description: "Failed to submit review.", variant: "destructive" });
        }
    };

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 3);
    };

    return (
        <div className="mt-10 border-t pt-8">
            <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

            <div className="space-y-6 mb-10">
                {reviews.slice(0, visibleCount).map((review, index) => (
                    <div key={index} className="border-b pb-4">
                        <div className="flex items-center gap-3">
                            {review.reviewerPhoto ? (
                                <img
                                    src={review.reviewerPhoto}
                                    alt={review.reviewerName || "User"}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                                    {(review.reviewerName && review.reviewerName.length > 0) ? review.reviewerName.charAt(0).toUpperCase() : "U"}
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-lg block leading-tight">{review.reviewerName || "Anonymous"}</span>
                                <span className="text-sm text-gray-500 block leading-tight">{review.date}</span>
                            </div>
                        </div>
                        <div className="flex items-center mb-2">
                            <Rating
                                readonly
                                initialValue={review.rating}
                                size={20}
                                allowFraction={true}
                                SVGstyle={{ display: "inline-block" }}
                            />
                        </div>
                        <p className="text-gray-700">{review.reviewText}</p>
                    </div>
                ))}

                {visibleCount < reviews.length && (
                    <button
                        onClick={handleShowMore}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Show More
                    </button>
                )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold mb-4">Write a Review</h4>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Rating</label>
                    <Rating
                        onClick={handleRating}
                        initialValue={newRating}
                        size={30}
                        transition
                        allowFraction={false}
                        SVGstyle={{ display: "inline-block" }}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Review</label>
                    <textarea
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Write your experience..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                    ></textarea>
                </div>
                <button
                    onClick={handleSubmitReview}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
                >
                    Submit Review
                </button>
            </div>
        </div>
    );
};

export default ProductReviews;
