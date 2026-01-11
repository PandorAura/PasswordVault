package com.team2.passwordvault.backend.controller;

import com.team2.passwordvault.backend.controller.dto.AuthResponse;
import com.team2.passwordvault.backend.controller.dto.LoginRequest;
import com.team2.passwordvault.backend.controller.dto.RegisterRequest;
import com.team2.passwordvault.backend.model.User;
import com.team2.passwordvault.backend.model.VaultMetadata;
import com.team2.passwordvault.backend.repository.UserRepository;
import com.team2.passwordvault.backend.repository.VaultMetadataRepository;
import com.team2.passwordvault.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final VaultMetadataRepository vaultMetadataRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        user = userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(Collections.emptyList())
                .build();

        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        var authToken = new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()
        );
        authenticationManager.authenticate(authToken);


        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(Collections.emptyList())
                .build();

        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/delete-account")
    public ResponseEntity<Void> deleteAccount(@RequestBody DeleteAccountRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing email");
        }
        if (request.authHash() == null || request.authHash().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing authHash");
        }

        VaultMetadata meta = vaultMetadataRepository.findByUser_Email(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vault not set up"));

        if (!request.authHash().equals(meta.getAuthHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid master password");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        vaultMetadataRepository.delete(meta);
        userRepository.delete(user);

        return ResponseEntity.noContent().build();
    }

    public record DeleteAccountRequest(String email, String authHash) {}
}