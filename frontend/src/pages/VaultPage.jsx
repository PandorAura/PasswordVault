import VaultHeader from "../features/vault/components/VaultHeader";
import VaultList from "../features/vault/components/VaultList";
import AddPasswordModal from "../features/vault/components/AddPasswordModal";
import EditPasswordModal from "../features/vault/components/EditPasswordModal";
import VaultToolbar from "../features/vault/components/VaultToolbar";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

import { logout } from "../features/auth/authSlice";
import { clearVault } from "../features/vault/vaultSlice";
import DeleteAccountDialog from "../features/auth/DeleteAccountDialog";
import { deleteAccountWithMasterRequest } from "../features/auth/authApi";
import apiClient from "../utils/apiClient";
import { deriveSecrets } from "../utils/cryptoUtils";

export default function VaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleLogout = () => {
    dispatch(clearVault());
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const getEmailFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload).sub;
    } catch {
      return null;
    }
  };

  const handleDeleteAccount = async ({ masterPassword }) => {
    const email = getEmailFromToken();
    if (!email) throw new Error("Missing session.");

    const { data } = await apiClient.get("/api/vault/salt", { params: { email } });
    const { authHash } = await deriveSecrets(masterPassword, data.salt);

    await deleteAccountWithMasterRequest(email, authHash);
    dispatch(clearVault());
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <VaultHeader
        onLogout={handleLogout}
        onDeleteAccount={() => setIsDeleteAccountOpen(true)}
      />

      <VaultToolbar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        onOpenModal={() => setIsModalOpen(true)}
        onCheckBreaches={() => navigate("/breaches")}
      />

      <VaultList 
        onEditItem={handleEditItem} 
        search={search} 
        category={category} 
      />

      {isModalOpen && (
        <AddPasswordModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}

      <EditPasswordModal 
        open={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        item={editingItem} 
      />

      <DeleteAccountDialog
        open={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={async (payload) => {
          await handleDeleteAccount(payload);
          setIsDeleteAccountOpen(false);
        }}
      />
    </Box>
  );
}