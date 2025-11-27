package com.team2.passwordvault.backend;

import com.team2.passwordvault.backend.dto.PasswordRequest;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional // Rolls back database changes after each test
class PasswordServiceIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private PasswordRepository passwordRepository;

    private UUID testUserUuid; // Variable to hold the dynamic ID

    @BeforeEach
    void setupTestUser() {
        // 1. Create a FRESH user for this specific test run.
        // We do NOT set the ID manually. We let the DB/Hibernate generate it.
        User testUser = new User();
        //testUserUuid = UUID.randomUUID();
        testUser.setId(testUserUuid);
        testUser.setName("Test user");
        testUser.setEmail("test.user." + UUID.randomUUID() + "@example.com"); // Ensure unique email
        // Add other required fields if necessary (e.g. passwordHash)
        testUser.setPasswordHash("..");
        testUser.setCreatedAt(Instant.now());
        testUser.setUpdatedAt(Instant.now());
        // 2. Save it. Hibernate will generate the UUID and assign it to testUser.
        testUser = userRepository.saveAndFlush(testUser);

        // 3. Store the generated ID to use in the test
        this.testUserUuid = testUser.getId();
    }

    @Test
    void saveNewPassword_shouldPersistDataCorrectly() {
        // ARRANGE
        PasswordRequest request = PasswordRequest.builder()
                .userId(testUserUuid)
                .title("Test Pass")
                .username("test_username")
                .password("test_raw_password")
                .build();

        // ACT
        // Pass the DYNAMIC ID we created in setup()
        Password savedEntry = passwordService.saveNewPassword(request);

        // ASSERT
        Optional<Password> found = passwordRepository.findById(savedEntry.getId());

        assertTrue(found.isPresent(), "Saved password should be retrievable by ID.");
        assertEquals("test_raw_password", found.get().getPassword(), "The raw password should be saved correctly.");
        assertEquals(testUserUuid, found.get().getUser().getId(), "Password should be linked to the correct user.");
    }
}