import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage.jsx";
import VaultPage from "../pages/VaultPage.jsx";
import MasterPasswordSetupPage from "../pages/MasterPasswordSetupPage.jsx";
import MasterPasswordCheckPage from "../pages/MasterPasswordCheckPage.jsx";
import BreachesPage from "../pages/BreachesPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/vault" element={<VaultPage />} />
      <Route path="/breaches" element={<BreachesPage />} />
      <Route path="/create-master" element={<MasterPasswordSetupPage />} />
      <Route path="/check-master" element={<MasterPasswordCheckPage />} />

      {/* Redirect root → /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Any unknown route → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
