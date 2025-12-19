package com.team2.passwordvault.backend.service.mappers;

import com.team2.passwordvault.backend.controller.dto.PasswordResponse;
import com.team2.passwordvault.backend.model.Password;

public class PasswordMapper {

    public static PasswordResponse toResponse(Password password) {
        return PasswordResponse.builder()
                .id(password.getId())
                .title(password.getTitle())
                .usernameOrEmail(password.getUsernameOrEmail())
                .websiteUrl(password.getWebsiteUrl())
                .password(password.getPassword())
                .category(String.valueOf(password.getCategory()))
                .strength(String.valueOf(password.getStrength()))
                .build();
    }
}
