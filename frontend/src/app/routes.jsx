import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import VaultPage from "../pages/VaultPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<VaultPage />} />
    </Routes>
  );
}
