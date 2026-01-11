package com.team2.passwordvault.backend.service.mappers;

import com.team2.passwordvault.backend.controller.dto.PasswordResponse;
import com.team2.passwordvault.backend.enums.PasswordStrength;
import com.team2.passwordvault.backend.model.Password;

public class PasswordMapper {

    public static PasswordResponse toResponse(Password password) {
        return new PasswordResponse(
                password.getId(),
                password.getTitle(),
                password.getUsernameOrEmail(),
                password.getWebsiteUrl(),
                password.getEncryptedPassword(),
                password.getEncryptionIv(),
                password.getNotes(),
                String.valueOf(password.getCategory()),
                toStrengthLabel(password.getStrength()),
                password.getUpdatedAt() == null ? null : password.getUpdatedAt().toString()
        );
    }

    private static String toStrengthLabel(PasswordStrength strength) {
        if (strength == null) return null;
        return switch (strength) {
            case VERYWEAK -> "Very Weak";
            case WEAK -> "Weak";
            case FAIR -> "Fair";
            case STRONG -> "Strong";
            case VERYSTRONG -> "Very Strong";
        };
    }
}
