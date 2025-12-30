import Navbar from "@/components/custom/Navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "../components/custom/Footer/Footer";
import MiniCart from "@/components/custom/Cart/MiniCart";

function Layout() {
  return (
    <div>
      <MiniCart />
      <Navbar />
      <div className="mt-24">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
