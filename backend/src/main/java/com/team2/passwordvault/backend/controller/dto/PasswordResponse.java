package com.team2.passwordvault.backend.controller.dto;

import java.util.UUID;

public record PasswordResponse(
        UUID id,
        String title,
        String usernameOrEmail,
        String websiteUrl,
        String encryptedPassword,
        String encryptionIv,
        String notes,
        String category,
        String strength,
        String updatedAt
) {}
