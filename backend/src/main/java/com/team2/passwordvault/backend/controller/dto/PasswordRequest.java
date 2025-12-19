package com.team2.passwordvault.backend.controller.dto;

import lombok.Builder;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Data
@Value
@Builder(toBuilder = true)
@Jacksonized
public class PasswordRequest {

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Username is required")
    String username;

    @NotBlank(message = "Encrypted Password is required")
    String encryptedPassword;

    @NotBlank(message = "Encryption IV is required")
    String encryptionIv;

    String url;

    String category;

    String notes;
}