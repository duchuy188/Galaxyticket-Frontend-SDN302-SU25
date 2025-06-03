import React from "react";
import "./App.css";

import PageNotFound from "./containers/PageNotDefault";

import { routesHome, routesAdmin } from "./routes";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomeTemplate from "./templates/HomeTemplate";
import AdminTemplate from "./templates/AdminTemplate";
import AuthHome from "./components/Auth";
import SignUp from "../src/components/SignUp";

function App() {
  const showMenuHome = (routes) => {
    if (routes && routes.length > 0) {
      return routes.map((item, index) => (
        <Route
          key={index}
          path={item.path}
          element={<HomeTemplate Component={item.component} />}
        />
      ));
    }
  };

  const showMenuAdmin = (routes) => {
    if (routes && routes.length > 0) {
      return routes.map((item, index) => (
        <Route
          key={index}
          path={item.path}
          element={<AdminTemplate Component={item.component} />}
        />
      ));
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {showMenuHome(routesHome)}
        {showMenuAdmin(routesAdmin)}
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/auth-home" element={<AuthHome />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
