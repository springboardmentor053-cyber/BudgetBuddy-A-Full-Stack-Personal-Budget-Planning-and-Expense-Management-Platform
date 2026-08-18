import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">

      <Sidebar sidebarOpen={sidebarOpen} />

      <div
  className={`flex-1 transition-all duration-300 ${
    sidebarOpen ? "ml-64" : "ml-0"
  }`}
>
        <Navbar 
         sidebarOpen={sidebarOpen}
         setSidebarOpen={setSidebarOpen} />

        <Outlet />

      </div>

    </div>
  );
}

export default Layout;