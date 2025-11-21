import VaultHeader from "../features/vault/VaultHeader";
import VaultList from "../features/vault/VaultList";
import AddPasswordModal from "../features/vault/AddPasswordModal";
import EditPasswordModal from "../features/vault/EditPasswordModal";
import { useState } from "react";

export default function VaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  return (
    <div>
      <VaultHeader onOpenModal={() => setIsModalOpen(true)} />
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
