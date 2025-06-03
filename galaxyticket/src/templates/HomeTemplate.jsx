import React from "react";
import { Navigate } from "react-router-dom";
import NavbarUser from "./../components/Navbar";

function HomeLayout({ children }) {
  // Nếu children là một route tới /detail-ticketroom thì không hiện NavbarUser
  if (children?.props?.location?.pathname === "/detail-ticketroom") {
    return <div>{children}</div>;
  } else {
    return (
      <div>
        <NavbarUser />
        {children}
      </div>
    );
  }
}

export default function HomeTemplate({ Component, ...props }) {
  // Kiểm tra đăng nhập
  const isLoggedIn = !!localStorage.getItem("userHome");

  // Nếu chưa đăng nhập thì chuyển hướng
  if (!isLoggedIn) {
    return <Navigate to="/auth-home" replace />;
  }

  // Nếu đã đăng nhập thì render layout và component
  return (
    <HomeLayout>
      <Component {...props} />
    </HomeLayout>
  );
}
