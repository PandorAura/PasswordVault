package com.team2.passwordvault.backend.model;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.team2.passwordvault.backend.enums.PasswordCategory;
import com.team2.passwordvault.backend.enums.PasswordStrength;


@Entity
@Table(name = "passwords")
public class Password {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    // Foreign key to User table
    @Column(name = "user_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID userId; // Use actual User entity when available

    private String password;
    private String websiteUrl;

    @Enumerated(EnumType.STRING)
    private PasswordCategory category;

    @Enumerated(EnumType.STRING)
    private PasswordStrength strength;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public PasswordCategory getCategory() { return category; }
    public void setCategory(PasswordCategory category) { this.category = category; }

    public PasswordStrength getStrength() { return strength; }
    public void setStrength(PasswordStrength strength) { this.strength = strength; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}