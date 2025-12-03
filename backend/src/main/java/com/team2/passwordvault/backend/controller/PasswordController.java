package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.model.Password;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.repository.PasswordRepository;
import com.team2.passwordvault.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

        if (password == null) {
            return ResponseEntity.status(404).body("Password entry not found");
        }

        passwordRepository.delete(password);

        return ResponseEntity.ok("Password deleted successfully");
    }
}
