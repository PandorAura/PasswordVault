package com.team2.passwordvault.backend.controller.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PasswordResponse {

    private UUID id;
    private String title;
    private String usernameOrEmail;
    private String websiteUrl;
    private String encryptedPassword;
    private String encryptionIv;
    private String notes;
    private String category;
    private String strength;
}
