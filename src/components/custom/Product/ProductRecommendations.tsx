import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import ProductCard from '../ProductList/ProductCard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserFavorites } from '@/utils/fetchUserFavorites';
import { handleToggleFavorite } from '@/utils/favorites';
import toast from 'react-hot-toast';

interface ProductRecommendationsProps {
    currentProduct: any;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ currentProduct }) => {
    const { products } = useSelector((state: RootState) => state.products);
    const allProducts = Object.values(products);
    const [favorites, setFavorites] = useState<string[]>([]);
    const auth = getAuth();
    const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid || null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        if (userId) {
            fetchUserFavorites(userId).then(setFavorites);
        } else {
            setFavorites([]);
        }
    }, [userId]);

    const onToggleFavorite = async (id: string) => {
        if (!userId) {
            toast.error("Please login to manage favorites");
            return;
        }
        const isFav = favorites.includes(id);
        setFavorites(prev => isFav ? prev.filter(fid => fid !== id) : [...prev, id]);
        await handleToggleFavorite(userId, id);
    };

    const recommended = allProducts
        .filter((p: any) =>
            p.id !== currentProduct.id &&
            p.categories &&
            currentProduct.categories &&
            p.categories.some((c: string) => currentProduct.categories.includes(c))
        )
        .slice(0, 4);

    const finalInclusions = recommended.length > 0 ? recommended : allProducts.filter((p: any) => p.id !== currentProduct.id).sort(() => 0.5 - Math.random()).slice(0, 4);

    if (finalInclusions.length === 0) return null;

    return (
        <div className="mt-16 mb-8">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {finalInclusions.map((product: any) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
