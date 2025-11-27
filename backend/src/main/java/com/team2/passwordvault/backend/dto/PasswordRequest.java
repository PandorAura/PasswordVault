package com.team2.passwordvault.backend.dto;

import lombok.Builder;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.UUID;

@Data
@Value
@Builder(toBuilder = true)
@Jacksonized
public class PasswordRequest {

    @NotBlank
    UUID userId;

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Username is required")
    String username;

    @NotBlank(message = "Password is required")
    String password;

    String url;

    String category;

    String notes;
}