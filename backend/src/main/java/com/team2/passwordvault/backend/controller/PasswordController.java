package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.PasswordRepository;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.service.PasswordService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/passwords")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordRepository passwordRepository;
    private final UserRepository userRepository;

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deletePassword(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Password password = passwordRepository.findByIdAndUser(id, user)
                .orElse(null);
    private final PasswordService passwordService;

    /**
     * Endpoint to add a new password entry to the vault.
     */
    @PostMapping
    public ResponseEntity<Password> addPassword(@Valid @RequestBody PasswordRequest request) {
        try {
            Password savedEntry = passwordService.saveNewPassword(request);
            return new ResponseEntity<>(savedEntry, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Handle user not found or other service exceptions
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        if (password == null) {
            return ResponseEntity.status(404).body("Password entry not found");
        }

        passwordRepository.delete(password);

        return ResponseEntity.ok("Password deleted successfully");
    }
}
