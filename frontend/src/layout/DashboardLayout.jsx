

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

export default function DashboardLayout() {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Navbar setIsOpen={setIsOpen} />

      <div className="flex pt-16">

        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        <main className="flex-1 md:ml-72 p-4 md:p-8">
          <Outlet />
        </main>

      </div>
    </>
  );
}