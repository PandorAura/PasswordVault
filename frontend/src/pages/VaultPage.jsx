import VaultHeader from "../features/vault/components/VaultHeader";
import VaultList from "../features/vault/components/VaultList";
import AddPasswordModal from "../features/vault/components/AddPasswordModal";
import EditPasswordModal from "../features/vault/components/EditPasswordModal";
import VaultToolbar from "../features/vault/components/VaultToolbar";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Snackbar, Alert } from "@mui/material";

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
  const [deleteSnackbar, setDeleteSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

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

    const { data } = await apiClient.get("/api/vault/salt", {
      params: { email },
    });
    const { authHash } = await deriveSecrets(masterPassword, data.salt);

    await deleteAccountWithMasterRequest(email, authHash);
    dispatch(clearVault());
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleDeleteSuccess = () => {
    setDeleteSnackbar({
      open: true,
      message: "Password deleted successfully!",
      type: "success",
    });
  };

  const handleDeleteError = (errorMsg) => {
    setDeleteSnackbar({
      open: true,
      message: errorMsg || "Failed to delete password",
      type: "error",
    });
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

      {/* Keep both: filtering + delete notifications */}
      <VaultList
        onEditItem={handleEditItem}
        search={search}
        category={category}
        onDeleteSuccess={handleDeleteSuccess}
        onDeleteError={handleDeleteError}
      />

      <AddPasswordModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

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

      {/* DELETE SNACKBAR NOTIFICATION */}
      <Snackbar
        open={deleteSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setDeleteSnackbar({ ...deleteSnackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: { xs: "16px", sm: "24px" },
          zIndex: 9999,
        }}
      >
        <Alert
          onClose={() => setDeleteSnackbar({ ...deleteSnackbar, open: false })}
          severity={deleteSnackbar.type}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 3,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            "& .MuiAlert-icon": {
              fontSize: "1.25rem",
            },
            ...(deleteSnackbar.type === "success" && {
              backgroundColor: "#6366F1",
              "&:hover": {
                backgroundColor: "#5855eb",
              },
            }),
          }}
        >
          {deleteSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
