package com.team2.passwordvault.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class PasswordRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private String url;

    private String category;

    private String notes;
    // private Long userId; ask Aris about auth
}