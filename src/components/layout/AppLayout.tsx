import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { ToastContainer } from "../UI/Toast";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

function getStoredUser() {
  try {
    const stored = localStorage.getItem("clinic_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AppLayout() {
  const user = getStoredUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 transition-[padding] duration-200">
        <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
