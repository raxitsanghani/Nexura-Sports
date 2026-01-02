import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Layout from "./layout/Layout";
import {
  Home,
  Kids,
  Man,
  Product,
  Sale,
  Sports,
  Woman,
  Cart,
  Checkout,
  Favorites,
  Orders,
} from "./pages";
import Signup from "./Auth/Signup";
import Login from "./Auth/Login";
import ProtectedRoute from "./pages/Protected/ProtectedRoute";
import Profile from "./pages/Other/Profile";
import OrderConfirmation from "./pages/Other/OrderConfirm";
import AdminRoutes from "./Admin/AdminRoutes";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot, getDoc } from "firebase/firestore";
import { Toaster, toast } from 'react-hot-toast'; // Using react-hot-toast for global app notifications

const capitalizePath = (path: string) => {
  const capitalized = path.slice(1).replace(/^\w/, (c) => c.toUpperCase());
  return capitalized;
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const titleElement = document.getElementById("title");
    if (titleElement) {
      if (location.pathname === "/") {
        document.title = "Nexura Sports - Home";
      } else {
        const pathName = capitalizePath(location.pathname);
        document.title = "Nexura Sports - " + pathName;
      }
    }
  }, [location]);

  // Real-time Authentication Monitoring
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 1. Check if user is in 'deleted_users' blacklist (Historical check/Login check)
        const deletedRef = doc(db, "deleted_users", currentUser.email || "unknown");

        try {
          const deletedSnap = await getDoc(deletedRef);
          if (deletedSnap.exists()) {
            await signOut(auth);
            toast.error("Your account has been permanently deleted.", {
              id: 'auth-error', // Prevent duplicate toasts
              duration: 5000,
              style: { background: '#fff', color: '#F44336' }
            });
            navigate("/login");
            return;
          }
        } catch (e) {
          console.error("Auth check error", e);
        }

        // 2. Real-time User Document Listener
        // This handles "Block user while active" and "Delete user while active"
        // Only attach if user exists in auth
        const userRef = doc(db, "users", currentUser.uid);

        const unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
          // Case A: User Document Deleted (Permanent Delete)
          if (!docSnap.exists()) {
            // Ensure we don't kick out if it's a brand new signup that hasn't written doc yet. 
            // Usually signup writes doc immediately.
            // To be safe, maybe check creation time? 
            // Simplest: If doc gone, you gone.
            if (auth.currentUser) {
              await signOut(auth);
              toast.error("Your account has been permanently deleted.", {
                id: 'auth-error-deleted',
                duration: 5000
              });
              navigate("/login");
            }
          }
          // Case B: User Blocked
          else if (docSnap.data().isBlocked) {
            if (auth.currentUser) {
              await signOut(auth);
              toast.error("Your account has been blocked by the administrator.", {
                id: 'auth-error-blocked',
                duration: 5000
              });
              navigate("/login");
            }
          }
        }, (error) => {
          console.log("Auth snapshot error (likely permission denied due to block/delete):", error);
          // Permission denied often happens if rules say "allow read if !blocked". 
          // If so, we assume blocked/deleted.
          if (auth.currentUser) {
            signOut(auth);
            navigate("/login");
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminRoutes />} /> {/* Admin routes */}
        {/* Main website routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" index element={<ProtectedRoute element={<Home />} />} />
          <Route path="/woman" element={<ProtectedRoute element={<Woman />} />} />
          <Route
            path="/product/:id"
            element={<ProtectedRoute element={<Product />} />}
          />
          <Route path="/man" element={<ProtectedRoute element={<Man />} />} />
          <Route path="/kids" element={<ProtectedRoute element={<Kids />} />} />
          <Route
            path="/sports"
            element={<ProtectedRoute element={<Sports />} />}
          />

          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route path="/sale" element={<ProtectedRoute element={<Sale />} />} />
          <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
          <Route
            path="/checkout"
            element={<ProtectedRoute element={<Checkout />} />}
          />
          <Route
            path="/favorites"
            element={<ProtectedRoute element={<Favorites />} />}
          />
          <Route
            path="/order-confirmation"
            element={<ProtectedRoute element={<OrderConfirmation />} />}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute element={<Orders />} />}
          />
        </Route>
        {/* Admin routes */}
      </Routes>
    </>
  );
};

export default App;
