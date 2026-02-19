import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { FaUsers } from "react-icons/fa6";
import { LuPackageCheck } from "react-icons/lu";
import { FaCartFlatbedSuitcase } from "react-icons/fa6";
import AuthContext from "@/Admin/context/authContext";
import { Logout } from "@mui/icons-material";
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { logout } = useContext(AuthContext);
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const activeLinkClass = "bg-green-50 text-green-700 shadow-sm border-r-4 border-green-600 font-bold";
  const inactiveLinkClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-white border-r border-slate-200/60 duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-8">
        <NavLink to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-black text-xl">N</span>
          </div>
          <span className="text-slate-900 text-2xl font-black tracking-tight">Nexura<span className="text-green-600">.</span></span>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="block lg:hidden text-slate-500 hover:text-slate-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto h-full px-4">
        <nav className="flex-1 space-y-8 py-4">
          <div>
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Dashboard</p>
            <ul className="space-y-1">
              <li>
                <SidebarLinkGroup activeCondition={pathname === "/admin" || pathname.includes("dashboard")}>
                  {(handleClick, open) => (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-3 w-full rounded-xl px-4 py-3 transition-all duration-300 ${pathname === "/admin" ? activeLinkClass : inactiveLinkClass}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className={`p-1.5 rounded-lg transition-colors ${pathname === "/admin" ? "bg-green-100/50" : "bg-slate-100 group-hover:bg-white"}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <span className="flex-1">Dashboard</span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </NavLink>
                      <div className={`mt-1 overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <ul className="pl-12 space-y-1 py-1">
                          <li>
                            <NavLink to="/admin" className={({ isActive }) => `block py-2 text-sm transition-colors ${isActive ? 'text-green-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>
                              eCommerce Overview
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  )}
                </SidebarLinkGroup>
              </li>
            </ul>
          </div>

          <div>
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Inventory & Data</p>
            <ul className="space-y-1">
              <li>
                <SidebarLinkGroup activeCondition={pathname.includes("product")}>
                  {(handleClick, open) => (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-3 w-full rounded-xl px-4 py-3 transition-all duration-300 ${pathname.includes("product") ? activeLinkClass : inactiveLinkClass}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className={`p-1.5 rounded-lg transition-colors ${pathname.includes("product") ? "bg-green-100/50" : "bg-slate-100 group-hover:bg-white"}`}>
                          <FaCartFlatbedSuitcase className="w-5 h-5" />
                        </div>
                        <span className="flex-1">Manage Products</span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </NavLink>
                      <div className={`mt-1 overflow-hidden transition-all duration-300 ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <ul className="pl-12 space-y-1 py-1">
                          <li><NavLink to="/admin/add-product" className={({ isActive }) => `block py-2 text-sm ${isActive ? 'text-green-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>Add New Product</NavLink></li>
                          <li><NavLink to="/admin/all-products" className={({ isActive }) => `block py-2 text-sm ${isActive ? 'text-green-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>Browse Products</NavLink></li>
                          <li><NavLink to="/admin/product-reviews" className={({ isActive }) => `block py-2 text-sm ${isActive ? 'text-green-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>Reviews Management</NavLink></li>
                        </ul>
                      </div>
                    </React.Fragment>
                  )}
                </SidebarLinkGroup>
              </li>
              <li>
                <NavLink to="/admin/order" className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${pathname.includes("order") ? activeLinkClass : inactiveLinkClass}`}>
                  <div className={`p-1.5 rounded-lg transition-colors ${pathname.includes("order") ? "bg-green-100/50" : "bg-slate-100 group-hover:bg-white"}`}>
                    <LuPackageCheck className="w-5 h-5" />
                  </div>
                  <span>Orders Console</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${pathname.includes("users") ? activeLinkClass : inactiveLinkClass}`}>
                  <div className={`p-1.5 rounded-lg transition-colors ${pathname.includes("users") ? "bg-green-100/50" : "bg-slate-100 group-hover:bg-white"}`}>
                    <FaUsers className="w-5 h-5" />
                  </div>
                  <span>User Directory</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <div className="py-6 border-t border-slate-100 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 font-bold group"
          >
            <div className="p-1.5 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
              <Logout className="w-5 h-5" />
            </div>
            <span>Terminate Session</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
