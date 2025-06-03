import React, { useEffect, useState } from "react";
import ManageFilm from "../../components/ManageFilm";
import jQuery from "jquery";
import ManageUser from "../../components/ManageUser";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import HistoryManage from "../../components/HistoryManage";

export default function Admin() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  useEffect(() => {
    (function ($) {
      "use strict";
      // Add active state to sidbar nav links
      var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
      $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function () {
        if (this.href === path) {
          $(this).addClass("active");
        }
      });

      // Toggle the side navigation
      $("#sidebarToggle").on("click", function (e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
      });
    })(jQuery);
  }, []);
  useEffect(() => {
    if (localStorage.getItem("userAdmin")) {
      let lg = JSON.parse(localStorage.getItem("userAdmin"));
      setLogin(`${lg.hoTen}`);
    } else {
      setLogin("Đăng nhập");
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("userAdmin");
    navigate("/");
  };
  return (
    <div>
      <section className="sb-nav-fixed">
        <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
          <Link className="navbar-brand" to="/">
            Fox Movie
          </Link>
          <button
            className="btn btn-link btn-sm order-1 order-lg-0"
            id="sidebarToggle"
            href="#"
          >
            <i className="fas fa-bars" />
          </button>
          {/* Navbar Search*/}
          <form className="d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-3 my-2 my-md-0">
            {/* <div className="input-group">
              <input className="form-control" type="text" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
              <div className="input-group-append">
                <button className="btn btn-primary" type="button"><i className="fas fa-search" /></button>
              </div>
            </div> */}
          </form>
          {/* Navbar*/}
          <ul className="navbar-nav ml-auto ml-md-0">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="userDropdown"
                href="#"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {login ? login : <i className="fas fa-user fa-fw" />}
              </a>
              <div
                className="dropdown-menu dropdown-menu-right"
                aria-labelledby="userDropdown"
              >
                <a className="dropdown-item" href="#" onClick={handleLogout}>
                  Logout
                </a>
              </div>
            </li>
          </ul>
        </nav>
        <div id="layoutSidenav">
          <div id="layoutSidenav_nav">
            <nav
              className="sb-sidenav accordion sb-sidenav-dark"
              id="sidenavAccordion"
            >
              <div className="sb-sidenav-menu">
                <div className="nav">
                  <a
                    className="nav-link active"
                    id="v-pills-film-tab"
                    data-toggle="pill"
                    href="#v-pills-film"
                    role="tab"
                    aria-controls="v-pills-film"
                    aria-selected="true"
                  >
                    <div className="sb-nav-link-icon">
                      <i className="fa fa-film"></i>
                    </div>
                    Quản lý phim
                  </a>
                  <a
                    className="nav-link"
                    id="v-pills-user-tab"
                    data-toggle="pill"
                    href="#v-pills-user"
                    role="tab"
                    aria-controls="v-pills-user"
                    aria-selected="false"
                  >
                    <div className="sb-nav-link-icon">
                      <i className="fa fa-user"></i>
                    </div>
                    Quản lý người dùng
                  </a>
                  <a
                    className="nav-link"
                    id="v-pills-chart-tab"
                    data-toggle="pill"
                    href="#v-pills-chart"
                    role="tab"
                    aria-controls="v-pills-chart"
                    aria-selected="false"
                  >
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-chart-area" />
                    </div>
                    Báo cáo thống kê
                  </a>
                </div>
              </div>
            </nav>
          </div>
          <div id="layoutSidenav_content">
            <div className="tab-content" id="v-pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="v-pills-film"
                role="tabpanel"
                aria-labelledby="v-pills-film-tab"
              >
                <ManageFilm />
              </div>
              <div
                className="tab-pane fade"
                id="v-pills-user"
                role="tabpanel"
                aria-labelledby="v-pills-user-tab"
              >
                <ManageUser />
              </div>
              <div
                className="tab-pane fade"
                id="v-pills-chart"
                role="tabpanel"
                aria-labelledby="v-pills-chart-tab"
              >
                <HistoryManage />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
