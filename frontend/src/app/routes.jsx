import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage.jsx";
import VaultPage from "../pages/VaultPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/vault" element={<VaultPage />} />

      {/* Redirect root → /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Any unknown route → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}