package com.team2.passwordvault.backend;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.PasswordRepository;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.service.PasswordService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class PasswordServiceIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private PasswordRepository passwordRepository;

    private User savedUser; // Hold the full user object

    @BeforeEach
    void setupTestUser() {
        // 1. Create a FRESH user.
        // DO NOT set the ID manually. Let Hibernate generate it.
        User testUser = new User();
        String uniqueEmail = "test.user." + UUID.randomUUID() + "@example.com";

        testUser.setName("Test user");
        testUser.setEmail(uniqueEmail);
        testUser.setPasswordHash("dummyHash"); // Required if column is NOT NULL
        testUser.setCreatedAt(Instant.now());
        testUser.setUpdatedAt(Instant.now());

        // 2. Save it.
        savedUser = userRepository.saveAndFlush(testUser);

        // 3. MOCK THE SECURITY CONTEXT
        // This tells Spring Security: "This user is currently logged in"
        // The Service layer will read this email to find the user in the DB.
        var authToken = new UsernamePasswordAuthenticationToken(
                uniqueEmail, // The principal (must match DB email)
                null,
                Collections.emptyList() // Authorities (Roles)
        );
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    @Test
    void saveNewPassword_shouldPersistDataCorrectly() {
        // ARRANGE
        // Note: userId is REMOVED from the builder
        PasswordRequest request = PasswordRequest.builder()
                .title("Test Pass")
                .username("test_username")
                .password("test_raw_password")
                .build();

        // ACT
        // The service now pulls the User ID automatically from the SecurityContext
        Password savedEntry = passwordService.saveNewPassword(request);

        // ASSERT
        Optional<Password> found = passwordRepository.findById(savedEntry.getId());

        assertTrue(found.isPresent(), "Saved password should be retrievable by ID.");
        assertEquals("test_raw_password", found.get().getPassword());

        // Verify it was linked to the correct user we created in setup
        assertEquals(savedUser.getId(), found.get().getUser().getId());
    }
}