package com.team2.passwordvault.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordRequest(
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "Username is required") String username,
        @NotBlank(message = "Encrypted Password is required") String encryptedPassword,
        @NotBlank(message = "Encryption IV is required") String encryptionIv,
        String url,
        String category,
        String notes,
        String strength
) {}