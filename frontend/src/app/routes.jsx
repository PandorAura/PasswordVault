import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "../pages/LoginPage.jsx";
import VaultPage from "../pages/VaultPage.jsx";
import MasterPasswordSetupPage from "../pages/MasterPasswordSetupPage.jsx";
import MasterPasswordCheckPage from "../pages/MasterPasswordCheckPage.jsx";
import BreachesPage from "../pages/BreachesPage.jsx";

export default function AppRoutes() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const requireAuth = (element) =>
    isAuthenticated ? element : <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/vault" element={requireAuth(<VaultPage />)} />
      <Route path="/breaches" element={requireAuth(<BreachesPage />)} />
      <Route
        path="/create-master"
        element={requireAuth(<MasterPasswordSetupPage />)}
      />
      <Route
        path="/check-master"
        element={requireAuth(<MasterPasswordCheckPage />)}
      />

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
