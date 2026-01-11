package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.model.VaultMetadata;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.repository.VaultMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final UserRepository userRepository;
    private final VaultMetadataRepository vaultMetadataRepository;

    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> deleteAccount(
            Authentication authentication,
            @RequestHeader(name = "X-Master-Password", required = false) String providedAuthHash
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        if (providedAuthHash == null || providedAuthHash.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing X-Master-Password");
        }

        String email = authentication.getName();

        VaultMetadata meta = vaultMetadataRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Vault not set up"));

        if (!providedAuthHash.equals(meta.getAuthHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid master password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userRepository.delete(user);

        return ResponseEntity.noContent().build();
    }
}

