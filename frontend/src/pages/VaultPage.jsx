import VaultHeader from "../features/vault/VaultHeader";
import VaultList from "../features/vault/VaultList";
import AddPasswordModal from "../features/vault/AddPasswordModal";
import { useState } from "react";

export default function VaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <VaultHeader onOpenModal={() => setIsModalOpen(true)} />
      <VaultList />
      {/* 3. Conditionally render your modal */}
      {isModalOpen && (
        <AddPasswordModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
