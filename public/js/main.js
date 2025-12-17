import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBXgZe6FPfSyKoz8m3Uqrixcz-M0Fejz58",
    authDomain: "nexura-a5e21.firebaseapp.com",
    projectId: "nexura-a5e21",
    storageBucket: "nexura-a5e21.appspot.com",
    messagingSenderId: "45885832487",
    appId: "1:45885832487:web:30126eb365cfb894c83d02",
    measurementId: "G-HPNVD370MK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    const profilePicImg = document.getElementById('nav-profile-pic');
    if (user) {
        if (profilePicImg) {
            let src = user.photoURL;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().profilePic) {
                    src = userDoc.data().profilePic;
                }
            } catch (e) { console.error(e); }
            if (src) profilePicImg.src = src;
        }
        // If on favorites page, reload products to show favorites
        if (window.isFavoritesPage && document.getElementById('products-grid')) {
            loadProducts();
        }
    } else {
        const path = window.location.pathname;
        if (path === '/profile' || path === '/checkout' || path === '/order-confirmation' || path === '/orders') {
            window.location.href = '/login';
        }
        if (window.isFavoritesPage && document.getElementById('products-grid')) {
            document.getElementById('products-grid').innerHTML = '<p class="col-span-full text-center">Please <a href="/login" class="text-blue-600 underline">login</a> to view favorites.</p>';
        }
    }
});

/* Login Logic */
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Logging in...';
        btn.disabled = true;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/';
        } catch (error) {
            alert("Login Failed: " + error.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '/';
        } catch (error) {
            alert(error.message);
        }
    });
}

/* Signup Logic */
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const file = document.getElementById('signup-file').files[0];
        const btn = signupForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Signing Up...';
        btn.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            let profilePicUrl = "";

            if (file) {
                const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
                await uploadBytes(storageRef, file);
                profilePicUrl = await getDownloadURL(storageRef);
            }

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                profilePic: profilePicUrl,
                role: 'user',
                uid: user.uid
            });

            window.location.href = '/';
        } catch (error) {
            alert("Signup Failed: " + error.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// Cart Logic
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = total;
}
updateCartCount();

// Products Logic
const productsGrid = document.getElementById('products-grid');
if (productsGrid) {
    loadProducts();
}

async function loadProducts() {
    try {
        productsGrid.innerHTML = '';

        // Favorites Page Handling
        if (window.isFavoritesPage) {
            if (!auth.currentUser) return; // Auth listener handles redirect or msg

            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            let favIds = [];
            if (userSnap.exists() && userSnap.data().favorites) {
                favIds = userSnap.data().favorites;
            }

            if (favIds.length === 0) {
                productsGrid.innerHTML = '<p class="col-span-full text-center">No favorites yet.</p>';
                return;
            }

            const promises = favIds.map(id => getDoc(doc(db, "products", id)));
            const snapshots = await Promise.all(promises);

            snapshots.forEach(docSnap => {
                if (docSnap.exists()) {
                    const product = docSnap.data();
                    product.id = docSnap.id;
                    renderProductCard(product);
                }
            });
            return;
        }

        const querySnapshot = await getDocs(collection(db, "products"));
        if (querySnapshot.empty) {
            productsGrid.innerHTML = '<p class="col-span-full text-center">No products found.</p>';
            return;
        }
        let hasProducts = false;
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            product.id = doc.id;
            if (window.currentCategory) {
                if (product.categories && Array.isArray(product.categories) && product.categories.includes(window.currentCategory)) {
                    renderProductCard(product);
                    hasProducts = true;
                }
            } else {
                renderProductCard(product);
                hasProducts = true;
            }
        });
        if (!hasProducts) {
            productsGrid.innerHTML = '<p class="col-span-full text-center">No products found for ' + (window.currentCategory || 'this selection') + '.</p>';
        }
    } catch (error) {
        console.error(error);
        productsGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading products.</p>';
    }
}

function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = "rounded-lg border border-gray-200 bg-white p-6 shadow-sm";
    const ratingObj = product.rating || {};
    const ratings = Object.values(ratingObj);
    const totalPeople = ratings.length;
    const averageRating = totalPeople > 0 ? (ratings.reduce((a, b) => a + b, 0) / totalPeople).toFixed(2) : "0.00";
    card.innerHTML = `
        <div class="h-56 w-full">
            <a href="/product/${product.id}"><img class="mx-auto h-48 w-full object-cover rounded-lg" src="${product.defaultImage}" alt="${product.name}"></a>
        </div>
        <div class="pt-6">
            <div class="mb-4 flex items-center justify-between gap-4">
                <span class="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">${product.discount || ''}</span>
                 <div class="flex items-center justify-end gap-1">
                      <button class="rounded-lg p-2 hover:bg-gray-100 text-gray-500" onclick="toggleFavorite('${product.id}')">
                          <i class="ph ph-heart" style="font-size: 20px;"></i>
                      </button>
                 </div>
            </div>
            <a href="/product/${product.id}" class="text-lg font-semibold leading-tight text-gray-900 hover:underline block mb-2">${product.name}</a>
            <div class="flex items-center gap-2 mb-2">
                 <div class="flex text-yellow-500 text-sm"><i class="ph-fill ph-star"></i><span class="ml-1 text-gray-900">${averageRating}</span></div>
                 <span class="text-sm text-gray-500">(${totalPeople})</span>
            </div>
            <div class="mt-4 flex items-center justify-between gap-4">
                <p class="text-2xl font-extrabold leading-tight text-gray-900">$ ${product.price}</p>
                <button type="button" class="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black" onclick="addToCart('${product.id}')">Add</button>
            </div>
        </div>
    `;
    productsGrid.appendChild(card);
}

// Product Detail
const productDetail = document.getElementById('product-detail');
if (productDetail && window.productId) {
    loadProductDetail(window.productId);
}
async function loadProductDetail(id) {
    try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { renderProductDetail(docSnap.data(), id); }
        else { productDetail.innerHTML = '<p class="text-center">Product not found.</p>'; }
    } catch (e) {
        console.error(e);
        productDetail.innerHTML = '<p class="text-center text-red-500">Error loading product.</p>';
    }
}
function renderProductDetail(product, id) {
    const ratingObj = product.rating || {};
    const ratings = Object.values(ratingObj);
    const totalPeople = ratings.length;
    const averageRating = totalPeople > 0 ? (ratings.reduce((a, b) => a + b, 0) / totalPeople).toFixed(2) : "0.00";
    productDetail.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><img src="${product.defaultImage}" alt="${product.name}" class="w-full rounded-lg object-cover"></div>
            <div>
                <h1 class="text-3xl font-bold mb-4">${product.name}</h1>
                <div class="flex items-center gap-2 mb-4"><div class="flex text-yellow-500"><i class="ph-fill ph-star"></i><span class="ml-1 text-black font-bold">${averageRating}</span></div><span class="text-gray-500">(${totalPeople} reviews)</span></div>
                <p class="text-3xl font-bold mb-6">$ ${product.price}</p>
                <p class="text-gray-600 mb-6">${product.description || 'No description available.'}</p>
                 <div class="flex items-center gap-4 mb-4">
                    <button class="border p-2 rounded hover:bg-gray-100" onclick="toggleFavorite('${id}')">
                         <i class="ph ph-heart text-2xl"></i>
                    </button>
                </div>
                <div class="flex gap-4 mt-8"><button class="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-black w-full text-lg font-semibold" onclick="addToCart('${id}')">Add to Cart</button></div>
            </div>
        </div>
    `;
}

// Cart Logic (View)
const cartItemsContainer = document.getElementById('cart-items');
if (cartItemsContainer) {
    loadCart();
}
async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    const productIds = Object.keys(cart);
    if (productIds.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Your cart is empty.</p>';
        return;
    }
    try {
        cartItemsContainer.innerHTML = '';
        let grandTotal = 0;
        const promises = productIds.map(id => getDoc(doc(db, "products", id)));
        const snapshots = await Promise.all(promises);
        snapshots.forEach(snap => {
            if (snap.exists()) {
                const product = snap.data();
                const qty = cart[snap.id].quantity;
                const total = parseFloat(product.price) * qty;
                grandTotal += total;
                renderCartItem(product, qty, snap.id);
            }
        });
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.innerText = grandTotal.toFixed(2);
        document.getElementById('cart-summary').classList.remove('hidden');
    } catch (e) {
        console.error(e);
        cartItemsContainer.innerHTML = '<p class="text-center text-red-500">Error loading cart.</p>';
    }
}
function renderCartItem(product, qty, id) {
    const item = document.createElement('div');
    item.className = "flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200";
    item.innerHTML = `
        <img src="${product.defaultImage}" class="w-20 h-20 object-cover rounded-md" alt="${product.name}">
        <div class="flex-1">
            <h3 class="font-semibold text-lg">${product.name}</h3>
            <p class="text-gray-600">$ ${product.price}</p>
        </div>
        <div class="flex items-center gap-2">
            <button class="bg-gray-100 p-2 rounded hover:bg-gray-200" onclick="updateQty('${id}', -1)">-</button>
            <span class="font-medium w-8 text-center">${qty}</span>
            <button class="bg-gray-100 p-2 rounded hover:bg-gray-200" onclick="updateQty('${id}', 1)">+</button>
        </div>
        <button class="text-red-500 p-2 hover:bg-red-50" onclick="removeFromCart('${id}')"><i class="ph ph-trash"></i></button>
    `;
    cartItemsContainer.appendChild(item);
}

// Global functions
window.addToCart = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    if (!cart[productId]) { cart[productId] = { quantity: 0, productId }; }
    cart[productId].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart!');
};
window.updateQty = (id, change) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    if (cart[id]) {
        cart[id].quantity += change;
        if (cart[id].quantity <= 0) { delete cart[id]; }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCart();
    }
};
window.removeFromCart = (id) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCart();
};
window.toggleFavorite = async (productId) => {
    if (!auth.currentUser) {
        alert('Log in to add favorites.');
        return;
    }
    try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        let favorites = [];
        if (userSnap.exists() && userSnap.data().favorites) {
            favorites = userSnap.data().favorites;
        }

        if (favorites.includes(productId)) {
            favorites = favorites.filter(id => id !== productId);
            alert("Removed from favorites");
        } else {
            favorites.push(productId);
            alert("Added to favorites");
        }

        await setDoc(userRef, { favorites }, { merge: true });

        // Reload if on Favorites page
        if (window.isFavoritesPage && typeof loadProducts === 'function') {
            loadProducts();
        }
    } catch (e) {
        console.error(e);
        alert("Error updating favorites");
    }
};
