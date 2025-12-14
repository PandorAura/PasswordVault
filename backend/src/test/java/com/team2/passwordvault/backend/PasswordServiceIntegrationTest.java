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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PasswordServiceIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private PasswordRepository passwordRepository;

    private User savedUser;
    private String userEmail;

    @BeforeEach
    void setupTestUser() {

        userEmail = "test.user." + UUID.randomUUID() + "@example.com";

        User testUser = new User();
        testUser.setName("Test user");
        testUser.setEmail(userEmail);
        testUser.setPasswordHash("dummyHash");
        testUser.setCreatedAt(Instant.now());
        testUser.setUpdatedAt(Instant.now());

        savedUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    void saveNewPassword_shouldPersistDataCorrectly() {
        // ARRANGE
        PasswordRequest request = PasswordRequest.builder()
                .title("Test Pass")
                .username("test_username")
                .password("test_raw_password")
                .build();

        // ACT
        Password savedEntry = passwordService.saveNewPassword(request, userEmail);

        // ASSERT
        Optional<Password> found = passwordRepository.findById(savedEntry.getId());

        assertTrue(found.isPresent(), "Saved password should exist");
        assertEquals("test_raw_password", found.get().getPassword());
        assertEquals(savedUser.getId(), found.get().getUser().getId());
    }

    @Test
    void deletePassword_shouldSoftDeleteEntry() {
        // ARRANGE
        PasswordRequest request = PasswordRequest.builder()
                .title("To be deleted")
                .username("delete_user")
                .password("delete_pass")
                .build();

        Password savedEntry = passwordService.saveNewPassword(request, userEmail);

        // ACT
        passwordService.deletePassword(savedEntry.getId(), userEmail);

        // ASSERT
        Password deleted = passwordRepository.findById(savedEntry.getId())
                .orElseThrow();

    }
}
