package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.service.PasswordService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/passwords")
@RequiredArgsConstructor
public class PasswordController {

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
        }
    }
}