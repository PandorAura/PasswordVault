package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.controller.dto.PasswordRequest;
import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.service.PasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/passwords")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping
    public ResponseEntity<Password> addPassword(
            @Valid @RequestBody PasswordRequest request,
            Authentication authentication
    ) {
        Password saved = passwordService.saveNewPassword(
                request,
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassword(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        passwordService.deletePassword(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

