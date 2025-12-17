import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
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

const capitalizePath = (path: string) => {
  const capitalized = path.slice(1).replace(/^\w/, (c) => c.toUpperCase());
  return capitalized;
};

const App = () => {
  const location = useLocation();

  React.useEffect(() => {
    const titleElement = document.getElementById("title");
    if (titleElement) {
      if (location.pathname === "/") {
        document.title = "Nexura - Home";
      } else {
        const pathName = capitalizePath(location.pathname);
        document.title = "Nexura - " + pathName;
      }
    }
  }, [location]);

  return (
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
  );
};

export default App;
