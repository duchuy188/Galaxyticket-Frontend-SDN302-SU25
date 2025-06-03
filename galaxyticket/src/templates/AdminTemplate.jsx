import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function AdminLayout({ children }) {
  return <div>{children}</div>;
}

export default function AdminTemplate({ Component }) {
  const isAdmin = localStorage.getItem("userAdmin");
  if (!isAdmin) {
    return <Navigate to="/auth-home" replace />;
  }
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}
