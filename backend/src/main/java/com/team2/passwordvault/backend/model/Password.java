package com.team2.passwordvault.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.team2.passwordvault.backend.enums.PasswordCategory;
import com.team2.passwordvault.backend.enums.PasswordStrength;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "passwords")
public class Password {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(name = "username_email", nullable = false)
    private String usernameOrEmail;

    @Column(name = "encrypted_password", nullable = false, columnDefinition = "TEXT")
    private String encryptedPassword;

    @Column(name = "encryption_iv", nullable = false)
    private String encryptionIv;

    @Column(name = "website_url")
    private String websiteUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 50) // Matches SQL VARCHAR(50)
    private PasswordCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 50) // Matches SQL VARCHAR(50)
    private PasswordStrength strength;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}