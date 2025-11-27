package com.team2.passwordvault.backend.service;

import com.team2.passwordvault.backend.dto.PasswordRequest;
import com.team2.passwordvault.backend.enums.PasswordCategory;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.PasswordRepository;
import com.team2.passwordvault.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final PasswordRepository passwordRepository;
    private final UserRepository userRepository;

    public Password saveNewPassword(PasswordRequest request) {
        Optional<User> userOptional = userRepository.findById(request.getUserId());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Test user not found with ID: " + request.getUserId());
        }
        User user = userOptional.get();

        Password newEntry = new Password();
        newEntry.setTitle(request.getTitle());
        newEntry.setUsernameOrEmail(request.getUsername());
        newEntry.setPassword(request.getPassword());
        newEntry.setWebsiteUrl(request.getUrl());

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            try {
                newEntry.setCategory(PasswordCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                newEntry.setCategory(PasswordCategory.OTHER);
            }
        } else {
            newEntry.setCategory(PasswordCategory.OTHER);
        }
        // strength ??
        newEntry.setNotes(request.getNotes());
        newEntry.setUser(user); // Set the relationship owner

        user.getVaultEntries().add(newEntry);

        return passwordRepository.save(newEntry);
    }
}