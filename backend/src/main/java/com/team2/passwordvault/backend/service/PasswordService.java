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

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final PasswordRepository passwordRepository;
    private final UserRepository userRepository;

    // For now, we hardcode the user ID for testing purposes (ID 1, which you inserted)
    private static final Long TEST_USER_ID = 1L;

    public Password saveNewPassword(PasswordRequest request) {
        // 1. Fetch the User (required for the @ManyToOne relationship)
        Optional<User> userOptional = userRepository.findById(TEST_USER_ID);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Test user not found with ID: " + TEST_USER_ID);
        }
        User user = userOptional.get();

        // 2. Map DTO to Entity (Saving the password RAW as requested)
        Password newEntry = new Password();
        // newEntry.setTitle(request.getTitle());
        // newEntry.setUsername(request.getUsername());
        newEntry.setPassword(request.getPassword());
        newEntry.setWebsiteUrl(request.getUrl());
        newEntry.setCategory(PasswordCategory.valueOf(request.getCategory()));
        // strength ??
        newEntry.setNotes(request.getNotes());
        newEntry.setUser(user); // Set the relationship owner

        // IMPORTANT: Update the User's collection to maintain bidirectionality
        // This is necessary if you use orphanRemoval=true
        user.getVaultEntries().add(newEntry);

        // 3. Save the new entry
        return passwordRepository.save(newEntry);
    }
}