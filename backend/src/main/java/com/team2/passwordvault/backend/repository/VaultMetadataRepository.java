package com.team2.passwordvault.backend.repository;

import com.team2.passwordvault.backend.model.VaultMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface VaultMetadataRepository extends JpaRepository<VaultMetadata, UUID> {
    Optional<VaultMetadata> findByUser_Email(String email);
}