import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LoginPage from "./login_page/LoginPage";
import MainPage from "./main_page/MainPage";
import Callback from "./callback/Callback";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/main" element={<MainPage />} />
    </Routes>
  </BrowserRouter>
);
