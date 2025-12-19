package com.team2.passwordvault.backend.service;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.controller.dto.PasswordResponse;
import com.team2.passwordvault.backend.enums.PasswordCategory;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.PasswordRepository;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.service.mappers.PasswordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordService {

    private final PasswordRepository passwordRepository;
    private final UserRepository userRepository;

    /**
     * Create a new password entry for the authenticated user
     */
    public Password saveNewPassword(PasswordRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Password newEntry = new Password();
        newEntry.setTitle(request.getTitle());
        newEntry.setUsernameOrEmail(request.getUsername());
        newEntry.setEncryptedPassword(request.getEncryptedPassword());
        newEntry.setEncryptionIv(request.getEncryptionIv());
        newEntry.setWebsiteUrl(request.getUrl());
        newEntry.setNotes(request.getNotes());
        newEntry.setUser(user);

        // Category logic (kept from your original code)
        newEntry.setCategory(resolveCategory(request.getCategory()));

        return passwordRepository.save(newEntry);
    }

    /**
     * Delete a password owned by the authenticated user
     */
    public void deletePassword(UUID passwordId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Password password = passwordRepository
                .findByIdAndUser(passwordId, user)
                .orElseThrow(() -> new RuntimeException("Password entry not found"));

        passwordRepository.delete(password);
    }

    @Transactional(readOnly = true)
    public Page<PasswordResponse> getAllPasswords(
            String email,
            Pageable pageable
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return passwordRepository
                .findAllByUser(user, pageable)
                .map(PasswordMapper::toResponse);
    }

    /**
     * Update an existing password entry for the authenticated user
     */
    public Password updatePassword(UUID passwordId, PasswordRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Password existingPassword = passwordRepository
                .findByIdAndUser(passwordId, user)
                .orElseThrow(() -> new RuntimeException("Password entry not found or access denied"));

        existingPassword.setTitle(request.getTitle());
        existingPassword.setUsernameOrEmail(request.getUsername());
        existingPassword.setEncryptedPassword(request.getEncryptedPassword());
        existingPassword.setEncryptionIv(request.getEncryptionIv());
        existingPassword.setWebsiteUrl(request.getUrl());
        existingPassword.setNotes(request.getNotes());

        existingPassword.setCategory(resolveCategory(request.getCategory()));

        return passwordRepository.save(existingPassword);
    }

    /**
     * Category resolution helper
     */
    private PasswordCategory resolveCategory(String category) {
        if (category == null || category.isBlank()) {
            return PasswordCategory.OTHER;
        }

        try {
            return PasswordCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PasswordCategory.OTHER;
        }
    }
}
