package com.team2.passwordvault.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vault_metadata")
public class VaultMetadata {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // The random salt used for Argon2
    @Column(name = "kdf_salt", nullable = false)
    private String kdfSalt;

    // The "Authentication Hash" (Derived from the Encryption Key)
    // We store this to verify the password is correct without knowing the Encryption Key
    @Column(name = "auth_hash", nullable = false)
    private String authHash;
}