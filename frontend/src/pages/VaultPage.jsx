import VaultHeader from "../features/vault/VaultHeader";
import VaultList from "../features/vault/VaultList";
import AddPasswordModal from "../features/vault/AddPasswordModal";
import EditPasswordModal from "../features/vault/EditPasswordModal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

export default function VaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <VaultHeader
        onOpenModal={() => setIsModalOpen(true)}
        onLogout={handleLogout}
      />

      <VaultList onEditItem={handleEditItem} />

      {isModalOpen && (
        <AddPasswordModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <EditPasswordModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={editingItem}
      />
    </div>
  );
}