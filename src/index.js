import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom"; 
import App from "./App";
import LoginPage from "./login_page/LoginPage";
import MainPage from "./main_page/MainPage";
import Callback from "./callback/Callback";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/main" element={<MainPage />} />
      
      {/* === ADD THIS LINE BELOW === */}
      {/* This catches the Google redirect URL and sends it to Callback */}
      <Route path="*" element={<Callback />} />
      {/* =========================== */}
      
    </Routes>
  </HashRouter>
);