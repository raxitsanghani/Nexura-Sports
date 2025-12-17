import Navbar from "@/components/custom/Navbar/Navbar";
import { Outlet } from "react-router";
import Footer from "../components/custom/Footer/Footer";

function Layout() {
  return (
    <div>
      <Navbar />
      <div className="mt-24">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
