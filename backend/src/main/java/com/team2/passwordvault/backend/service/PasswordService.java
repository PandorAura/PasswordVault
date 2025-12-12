package com.team2.passwordvault.backend.service;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.enums.PasswordCategory;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.PasswordRepository;
import com.team2.passwordvault.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder; // <-- IMPORT THIS
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final PasswordRepository passwordRepository;
    private final UserRepository userRepository;

    public Password saveNewPassword(PasswordRequest request) {

        // 1. Get the email of the currently logged-in user from Spring Security
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Find the user in the database by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // 3. Map DTO to Entity
        Password newEntry = new Password();
        newEntry.setTitle(request.getTitle());
        newEntry.setUsernameOrEmail(request.getUsername());
        newEntry.setPassword(request.getPassword());
        newEntry.setWebsiteUrl(request.getUrl());

        // Category Logic
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            try {
                newEntry.setCategory(PasswordCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                newEntry.setCategory(PasswordCategory.OTHER);
            }
        } else {
            newEntry.setCategory(PasswordCategory.OTHER);
        }

        newEntry.setNotes(request.getNotes());

        // 4. Set the relationship
        newEntry.setUser(user);
        user.getVaultEntries().add(newEntry);

        return passwordRepository.save(newEntry);
    }
}