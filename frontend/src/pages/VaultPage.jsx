import VaultHeader from "../features/vault/components/VaultHeader";
import VaultList from "../features/vault/components/VaultList";
import AddPasswordModal from "../features/vault/components/AddPasswordModal";
import EditPasswordModal from "../features/vault/components/EditPasswordModal";
import VaultToolbar from "../features/vault/components/VaultToolbar";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

export default function VaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

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
      <VaultHeader onLogout={handleLogout} />

      <VaultToolbar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        onOpenModal={() => setIsModalOpen(true)}
        onCheckBreaches={() => console.log("Check breaches clicked")}
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
