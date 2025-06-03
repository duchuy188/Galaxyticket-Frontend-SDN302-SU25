import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";

function NavbarUser() {
  const [login, setLogin] = useState("");

  useEffect(() => {
    if (localStorage.getItem("userHome")) {
      let lg = JSON.parse(localStorage.getItem("userHome"));
      setLogin(`${lg.hoTen}`);
    } else {
      setLogin("Đăng nhập");
    }
  }, []);
  useEffect(() => {
    if (localStorage.getItem("userHome")) {
      localStorage.removeItem("userAdmin");
    } else {
      localStorage.removeItem("userHome");
    }
    if (login === "Đăng nhập")
      document.getElementById("lg").classList.remove("dropdown");
    else document.getElementById("lg").classList.add("dropdown");
  }, [login]);

  const handleLogOut = () => {
    localStorage.removeItem("userHome");
    setLogin("Đăng nhập");
  };
  return (
    <div>
      <header className="header ">
        <div className="header__nav " id="nav-test">
          <nav className="navbar navbar-expand-md navbar-light bg-light">
            <Link to="/" className="header__logo ml-3 mt-2 mb-0">
              <img src="../images/logo.png" alt="anh_LOGO" className="mb-0" />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mt-0 ml-auto">
                <li className="nav-item  ">
                  <Link
                    className="nav-link text-left text-md-center"
                    to="#"
                    href="#"
                    onClick={() => {
                      document
                        .getElementById("lichChieu")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Lịch chiếu
                  </Link>
                </li>
                <li className="nav-item  ">
                  <Link
                    className="nav-link text-left text-md-center"
                    to="#"
                    href="#"
                    onClick={() => {
                      document
                        .getElementById("cumRap")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Cụm rạp{" "}
                  </Link>
                </li>
                <li className="nav-item ">
                  <Link
                    className="nav-link text-left text-md-center"
                    to="#"
                    href="#"
                    onClick={() => {
                      document
                        .getElementById("tinTuc")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Tin tức{" "}
                  </Link>
                </li>
                <li className="nav-item ">
                  <Link
                    className="nav-link text-left text-md-center"
                    to="#"
                    href="#"
                    onClick={() => {
                      document
                        .getElementById("ungDung")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Ứng dụng
                  </Link>
                </li>
                <li
                  className="nav-item login  text-left text-md-center"
                  id="lg"
                >
                  <NavLink to="/auth-home">
                    {login === "Đăng nhập" ? "Đăng nhập" : `Xin chào ${login}`}
                  </NavLink>
                  {/* <a className="nav-link" href="#"><i className="fa fa-user" /> Đăng nhập</a> */}
                  <div
                    className="dropdown-content"
                    style={{ background: "white" }}
                  >
                    <button
                      className="btn logout"
                      onClick={handleLogOut}
                      style={{ textAlign: "left" }}
                    >
                      Đăng Xuất
                    </button>{" "}
                    <br />
                    <Link className="btn lichSuDatVe p-0" to="/history">
                      Lịch sử đặt vé
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}

export default NavbarUser;
